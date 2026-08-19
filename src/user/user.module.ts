import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { XpModule } from 'src/xp/xp.module';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { XpRecords } from 'src/xp/models/xp-record.model';

import { State } from 'src/states/models/state.model';
import { Lga } from 'src/states/models/lga.model';
import { StateExistsConstraint } from 'src/common/validators/IsStateExists';
import { LgaExistsConstraint } from 'src/common/validators/is-lga-exists.validator';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([User, State, Lga, XpRecords]),
    forwardRef(() => AuthModule),
    forwardRef(() => MailModule),
    forwardRef(() => XpModule),
  ],
  providers: [
    UserService,
    CloudinaryService,
    StateExistsConstraint,
    LgaExistsConstraint,
  ],
  controllers: [UserController],
  exports: [
    SequelizeModule,
    UserService,
    StateExistsConstraint,
    LgaExistsConstraint,
  ],
})
export class UserModule {}
