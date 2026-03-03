import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUsername = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return user?.username ?? user?.sub ?? '';
  },
);
