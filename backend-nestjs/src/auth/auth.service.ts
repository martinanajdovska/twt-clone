import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<{ username: string } | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
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
}
