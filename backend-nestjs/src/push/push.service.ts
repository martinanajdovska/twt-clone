import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class PushService {
  private readonly expo: Expo;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    const accessToken = process.env.EXPO_ACCESS_TOKEN;
    this.expo = new Expo({
      accessToken: accessToken || undefined,
    });
  }

  async sendNotificationToUser(
    username: string,
    message: Omit<ExpoPushMessage, 'to'>,
  ): Promise<void> {
    const user = await this.usersService.findByUsername(username);
    if (!user || !user.expoPushToken) {
      console.warn(`Push skipped: no expo push token for user ${username}`);
      return;
    }

    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.warn(
        `Push skipped: invalid Expo push token for user ${username}: ${user.expoPushToken}`,
      );
      return;
    }

    const messages: ExpoPushMessage[] = [
      {
        ...message,
        to: user.expoPushToken,
      },
    ];

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.warn('Expo push send failed:', error);
      }
    }
  }
}
