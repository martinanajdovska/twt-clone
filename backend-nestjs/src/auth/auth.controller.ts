import { Controller, Post, Get, Body, Res, Req } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { SessionDto } from './dto/session.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  async session(
    @Body() dto: SessionDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { access_token } =
      await this.authService.createSessionFromFirebaseToken(
        dto.idToken,
        dto.username,
      );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: isProd,
      path: '/',
      maxAge: 86400 * 1000, // 24h
      sameSite: isProd ? 'none' : 'lax',
    });

    return { message: 'Session created' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    return { message: 'Logged out' };
  }

  @Get('clear-session')
  clearSession(@Res() res: express.Response, @Req() req: express.Request) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/login?session_expired=1`);
  }
}
