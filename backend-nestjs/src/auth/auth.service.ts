import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../firebase/firebase.service';
import { createHmac, randomUUID } from 'crypto';
import { OAuthStateDto } from './dto/oauth-state.dto';
import { GoogleTokenResponseDto } from './dto/google-token-response.dto';
import { GoogleTokenInfoResponseDto } from './dto/google-token-info-response.dto';

type OAuthPlatform = 'native' | 'web';

@Injectable()
export class AuthService {
  private readonly oauthStateTtlMs = 10 * 60 * 1000;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async createSessionFromFirebaseToken(
    idToken: string,
    preferredUsername?: string,
  ): Promise<{ access_token: string }> {
    let decoded;
    try {
      decoded = await this.firebaseService.verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const firebaseUid = decoded.uid;
    const email = (decoded.email as string) || '';
    const user = await this.usersService.findOrCreateFromFirebase(
      firebaseUid,
      email,
      preferredUsername,
    );

    return {
      access_token: this.jwtService.sign({ sub: user.username }),
    };
  }

  getGoogleAuthorizeUrl(platform: OAuthPlatform, returnTo?: string): string {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      throw new UnauthorizedException(
        'Google OAuth is not configured on the server.',
      );
    }

    const state = this.createSignedState({
      nonce: randomUUID(),
      platform,
      createdAt: Date.now(),
      returnTo: this.sanitizeWebReturnTo(returnTo),
    });

    const query = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`;
  }

  async createSessionFromGoogleCode(
    code: string,
    state: string,
  ): Promise<{
    access_token: string;
    platform: OAuthPlatform;
    returnTo?: string;
  }> {
    const parsedState = this.verifySignedState(state);
    const idToken = await this.exchangeCodeForGoogleIdToken(code);
    const tokenInfo = await this.verifyGoogleIdToken(idToken);
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;

    if (!clientId || tokenInfo.aud !== clientId) {
      throw new UnauthorizedException('Google token audience mismatch.');
    }

    const issuer = tokenInfo.iss ?? '';
    if (
      !['accounts.google.com', 'https://accounts.google.com'].includes(issuer)
    ) {
      throw new UnauthorizedException('Invalid Google token issuer.');
    }

    const googleSub = tokenInfo.sub;
    const email = tokenInfo.email;
    if (!googleSub || !email) {
      throw new UnauthorizedException(
        'Google token is missing required claims.',
      );
    }

    const user = await this.usersService.findOrCreateFromFirebase(
      `google:${googleSub}`,
      email,
    );

    return {
      access_token: this.jwtService.sign({ sub: user.username }),
      platform: parsedState.platform,
      returnTo: parsedState.returnTo,
    };
  }

  getOAuthSuccessRedirect(
    accessToken: string,
    platform: OAuthPlatform,
    returnTo?: string,
  ): string {
    if (platform === 'native') {
      const mobileRedirectBase =
        process.env.MOBILE_OAUTH_CALLBACK_URI || 'mobile://auth/callback';
      const url = new URL(mobileRedirectBase);
      url.searchParams.set('access_token', accessToken);
      return url.toString();
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const url = new URL(returnTo || '/login', frontendUrl);
    url.searchParams.set('oauth', 'success');
    url.searchParams.set('access_token', accessToken);
    return url.toString();
  }

  getOAuthErrorRedirect(
    message: string,
    platform: OAuthPlatform = 'native',
  ): string {
    if (platform === 'native') {
      const mobileRedirectBase =
        process.env.MOBILE_OAUTH_CALLBACK_URI || 'mobile://auth/callback';
      const url = new URL(mobileRedirectBase);
      url.searchParams.set('error', message);
      return url.toString();
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const url = new URL('/login', frontendUrl);
    url.searchParams.set('oauth', 'error');
    url.searchParams.set('error', message);
    return url.toString();
  }

  private createSignedState(payload: OAuthStateDto): string {
    const stateSecret = process.env.GOOGLE_OAUTH_STATE_SECRET;
    if (!stateSecret) {
      throw new UnauthorizedException('GOOGLE_OAUTH_STATE_SECRET is missing.');
    }

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = createHmac('sha256', stateSecret)
      .update(encodedPayload)
      .digest('base64url');
    return `${encodedPayload}.${signature}`;
  }

  private verifySignedState(state: string): OAuthStateDto {
    const stateSecret = process.env.GOOGLE_OAUTH_STATE_SECRET;
    if (!stateSecret) {
      throw new UnauthorizedException('GOOGLE_OAUTH_STATE_SECRET is missing.');
    }

    const [encodedPayload, signature] = (state || '').split('.');
    if (!encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid OAuth state.');
    }

    const expected = createHmac('sha256', stateSecret)
      .update(encodedPayload)
      .digest('base64url');
    if (signature !== expected) {
      throw new UnauthorizedException('Invalid OAuth state signature.');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as OAuthStateDto;

    if (!payload?.createdAt || !payload?.platform) {
      throw new UnauthorizedException('Invalid OAuth state payload.');
    }
    if (Date.now() - payload.createdAt > this.oauthStateTtlMs) {
      throw new UnauthorizedException('Expired OAuth state.');
    }
    if (payload.platform !== 'native' && payload.platform !== 'web') {
      throw new UnauthorizedException('Invalid OAuth platform.');
    }
    payload.returnTo = this.sanitizeWebReturnTo(payload.returnTo);

    return payload;
  }

  private sanitizeWebReturnTo(raw?: string): string | undefined {
    if (!raw) return undefined;
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol)) return undefined;

      const configuredOrigin = process.env.FRONTEND_URL
        ? new URL(process.env.FRONTEND_URL).origin
        : undefined;
      const isConfigured = configuredOrigin
        ? parsed.origin === configuredOrigin
        : false;
      const isLocalhost =
        parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      if (!isConfigured && !isLocalhost) return undefined;
      return parsed.toString();
    } catch {
      return undefined;
    }
  }

  private async exchangeCodeForGoogleIdToken(code: string): Promise<string> {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      throw new UnauthorizedException(
        'Google OAuth token exchange is not configured.',
      );
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!response.ok) {
      throw new UnauthorizedException('Google token exchange failed.');
    }

    const tokenJson = (await response.json()) as GoogleTokenResponseDto;
    if (!tokenJson.id_token) {
      throw new UnauthorizedException('Google did not return id_token.');
    }
    return tokenJson.id_token;
  }

  private async verifyGoogleIdToken(
    idToken: string,
  ): Promise<GoogleTokenInfoResponseDto> {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!response.ok) {
      throw new UnauthorizedException('Google token verification failed.');
    }
    return (await response.json()) as GoogleTokenInfoResponseDto;
  }
}
