import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { FindOptionsOrderValue } from 'typeorm';

export class PaginationOptionsDto {
  @ApiPropertyOptional({ type: String, default: 'DESC' })
  @IsOptional()
  readonly orderBy?: FindOptionsOrderValue = 'DESC';

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 200,
    default: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  readonly take: number = 50;

  @Expose({ name: 'skip' })
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
