import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { UserGroup } from './models/user-group.model';
import { GroupsService } from './services/group.service';
import { GroupController } from './controllers/group.controller';
import { GroupChatsService } from './services/group-chats.service';
import { GroupChatsController } from './controllers/group-chats.controller';
import { GroupChat } from './models/group-chats.model';
import { GroupChatGateway } from './gateways/group-chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { BunnyService } from 'src/common/services/bunny-all.service';

@Module({
  imports: [
     JwtModule.register({
          secret: process.env.JWT_SECRET_KEY,
          signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
        }),
    SequelizeModule.forFeature([
      Group, UserGroup, GroupChat
    ]),
  ],
  providers: [
    GroupsService, BunnyService, 
    GroupChatsService,
    GroupChatGateway,
  ],
  controllers: [
    GroupController,
    GroupChatsController,
  ],
  exports: [
    GroupsService,
    GroupChatsService,
    GroupChatGateway,
  ],
})
export class StudyCrewModule {}
