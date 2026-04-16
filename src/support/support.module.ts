import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { Complaint } from './models/complaint.model';
import { ComplaintComment } from './models/complaint-comment.model';
import { ComplaintService } from './services/complaint.service';
import { ComplaintCommentService } from './services/complaint-comment.service';
import { ComplaintController } from './controllers/complaint.controller';
import { ComplaintCommentController } from './controllers/complaint-comment.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([Complaint, ComplaintComment]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
  ],
  providers: [ComplaintService, ComplaintCommentService],
  controllers: [ComplaintController, ComplaintCommentController],
  exports: [ComplaintService, ComplaintCommentService],
})
export class SupportModule {}
