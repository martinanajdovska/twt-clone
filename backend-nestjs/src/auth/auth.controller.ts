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

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 86400 * 1000, // 24h
      sameSite: 'lax',
    });

    return { message: 'Session created' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.cookie('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    return { message: 'Logged out' };
  }

  @Get('clear-session')
  clearSession(@Res() res: express.Response, @Req() req: express.Request) {
    res.cookie('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/login?session_expired=1`);
  }
}
