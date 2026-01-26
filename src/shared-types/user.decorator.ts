// src/shared-types/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/models/user.model';

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // <- user injected by JwtAuthGuard
    return data ? user?.[data] : user;
  },
);
