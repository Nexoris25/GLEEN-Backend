import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { XpModule } from 'src/xp/xp.module';
import { XpWithdrawalRequest } from './models/xp-withdrawal-request.model';
import { XpRecords } from 'src/xp/models/xp-record.model';
import { XpLog } from 'src/xp/models/xp-log.model';
import { XpWithdrawalService } from './services/xp-withdrawal.service';
import { XpWithdrawalController } from './controllers/xp-withdrawal.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([XpWithdrawalRequest, XpRecords, XpLog]),
    forwardRef(() => AuthModule),
    XpModule,
  ],
  providers: [XpWithdrawalService],
  controllers: [XpWithdrawalController],
  exports: [XpWithdrawalService],
})
export class XpWithdrawalModule {}
