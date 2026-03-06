import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
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
}
