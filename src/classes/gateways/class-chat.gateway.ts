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
import { ClassChatService } from '../services/class-chat.service';

interface ClassRoomDto {
  classId: string;
  userId: string;
}

interface ClassMessageDto {
  classId: string;
  userId: string;
  message: string;
}

@WebSocketGateway({
  namespace: '/class-chat',
  cors: { origin: '*' },
})
export class ClassChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly classChatService: ClassChatService) {}

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
    @MessageBody() data: ClassRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.classId);
    this.server.to(data.classId).emit('userJoined', { userId: data.userId });
    return { event: 'joined', classId: data.classId, userId: data.userId };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: ClassRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.classId);
    this.server.to(data.classId).emit('userLeft', { userId: data.userId });
    return { event: 'left', classId: data.classId, userId: data.userId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: ClassMessageDto) {
    const message = await this.classChatService.create(
      { classId: data.classId, message: data.message },
      data.userId,
    );

    this.server.to(data.classId).emit('newMessage', message);
    return { event: 'messageSent', message };
  }
}
