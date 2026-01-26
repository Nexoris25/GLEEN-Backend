import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsStateExists } from 'src/common/validators/IsStateExists';

export class CreateLgaDto {
  @ApiProperty({
    description: 'Name of the Local Government Area',
    example: 'Ikeja',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'State ID this LGA belongs to',
    example: 'b1a8f4aa-8f91-4c41-8b07-9cb23d61caaa',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsStateExists({ message: 'State does not exist' })
  stateId: string;
}
