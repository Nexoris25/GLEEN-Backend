import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/models/user.model';

export class UserLoginResponse {
  @ApiProperty()
  user: User;

  @ApiProperty()
  token: string;

  @ApiProperty({
    example: 1768065600,
    description: 'JWT exp claim (unix timestamp in seconds)',
  })
  expiresIn: number;
}
