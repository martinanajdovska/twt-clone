import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../firebase/firebase.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  async validateUser(username: string, password: string): Promise<{ username: string } | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    return { username: user.username };
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const payload = await this.validateUser(username, password);
    if (!payload) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      access_token: this.jwtService.sign({ sub: payload.username }),
    };
  }

  async register(username: string, email: string, password: string): Promise<void> {
    await this.usersService.register(username, email, password, Role.USER);
  }

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
