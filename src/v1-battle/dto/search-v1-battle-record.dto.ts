import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchV1BattleRecordDto {
    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    v1BattleId?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    offset?: number;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    limit?: number;
}
