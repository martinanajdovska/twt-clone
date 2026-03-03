import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const cookies = req?.cookies;
          if (cookies?.token) return cookies.token;
          const auth = req?.headers?.authorization;
          if (auth?.startsWith('Bearer ')) return auth.slice(7);
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? configService.get<string>('BACKEND_JWT_SECRET') ?? 'default-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByUsername(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { username: user.username, id: user.id };
  }
}
