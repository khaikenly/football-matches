import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MatchFilterDto {
  @ApiPropertyOptional({
    description: 'Date of the match',
    example: '2025-04-22',
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'League ID',
    example: '1552',
    required: false,
  })
  @IsOptional()
  @IsString()
  leagueId?: string;
}
