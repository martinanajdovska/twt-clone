import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUsername } from 'src/common/decorators/current-user.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('api/push-tokens')
@UseGuards(JwtAuthGuard)
export class PushTokensController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async saveToken(
    @Body('token') token: string,
    @CurrentUsername() username: string,
  ) {
    await this.usersService.saveExpoPushToken(username, token);
  }
}
