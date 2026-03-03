import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() signIn: SignInDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { access_token } = await this.authService.login(
      signIn.username,
      signIn.password,
    );
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: false,
      path: '/',
      maxAge: 86400 * 1000, // 24h
      sameSite: 'lax',
    });
    return { message: 'Login successful' };
  }

  @Post('register')
  async register(@Body() signUp: SignUpDto) {
    await this.authService.register(signUp.username, signUp.email, signUp.password);
    return { message: 'User registered successfully' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.cookie('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    return { message: 'Logged out' };
  }

  @Get('clear-session')
  clearSession(@Res() res: express.Response, @Req() req: express.Request) {
    res.cookie('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?session_expired=1`);
  }
}
