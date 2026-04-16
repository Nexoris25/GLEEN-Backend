import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  JoinRoomDto,
  LeaveRoomDto,
  SendMessageDto,
  MarkAsReadDto,
} from '../dto/group-chat-gateway.dto';
import { GroupChatsService } from '../services/group-chats.service';

@WebSocketGateway({
  namespace: '/group-chat',
  cors: {
    origin: '*',
  },
})
export class GroupChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly groupChatService: GroupChatsService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    client.data = client.data || {};
    client.data.userId = userId;
    this.server.emit('userConnected', { userId });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId || client.id;
    this.server.emit('userDisconnected', { userId });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.groupId);
    this.server.to(data.groupId).emit('userJoined', { userId: data.userId });
    return { event: 'joined', groupId: data.groupId, userId: data.userId };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.groupId);
    this.server.to(data.groupId).emit('userLeft', { userId: data.userId });
    return { event: 'left', groupId: data.groupId, userId: data.userId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.groupChatService.create(
      {
        groupId: data.groupId,
        message: data.message,
      },
      data.userId,
    );

    this.server.to(data.groupId).emit('newMessage', message);
    return { event: 'messageSent', message };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: MarkAsReadDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.groupChatService.markAsRead(data.messageId);
    this.server
      .to(data.groupId)
      .emit('messageRead', { messageId: data.messageId, userId: data.userId });
    return {
      event: 'markedAsRead',
      messageId: data.messageId,
      userId: data.userId,
    };
  }
}
