import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      user?: { id: string };
      userId?: string;
    }>();
    console.log(request.userId || request.user.id);
    return request.userId || request.user?.id;
  },
);
