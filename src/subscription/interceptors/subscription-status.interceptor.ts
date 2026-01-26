import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class SubscriptionStatusInterceptor implements NestInterceptor {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];
        let userId: string | null = null;
        if (token) {
            try {
                const decoded = this.jwtService.verify(token);
                userId = decoded.sub;
            } catch (error) {
                console.error('JWT validation failed', error);
            }
        }
        if (userId) {
            try {
                const user = await this.userService.findOneById(userId);
                if (user && user.isSubscribed && user.subscriptionEndDate) {
                    const now = new Date();
                    if (now > new Date(user.subscriptionEndDate) && user.isSubscribed && user.subscriptionEndDate != null) {
                        user.isSubscribed = false;
                        await user.save();
                    }
                }
            } catch (error) {
                console.error('User retrieval failed', error);
            }
        }
        return next.handle();
    }
}
