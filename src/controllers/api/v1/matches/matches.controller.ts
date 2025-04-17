import { MatchFilterDto, PaginationOptionsDto } from '@/dtos';
import { MatchService } from '@/services/matches';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: 'matches',
})
export class MatchesController {
  constructor(private readonly matchesService: MatchService) {}

  @ApiOperation({
    summary: 'Get matches',
    description: 'Get matches with pagination and filter options',
  })
  @Get()
  async getMatches(
    @Query() paginate: PaginationOptionsDto,
    @Query() filter: MatchFilterDto,
  ) {
    return this.matchesService.getMatches(paginate, filter);
  }
}
