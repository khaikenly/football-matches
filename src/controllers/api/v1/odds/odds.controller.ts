import { MatchService } from '@/services/matches';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: 'odds/:matchId',
})
export class OddsController {
  constructor(private readonly matchesService: MatchService) {}

  @ApiOperation({
    summary: 'Get odds for a specific match',
    description: 'Get odds for a specific match by match ID',
  })
  @ApiParam({
    name: 'matchId',
    description: 'The ID of the match to get odds for',
    type: Number,
  })
  @Get()
  getOdds(@Param('matchId', new ParseIntPipe()) matchId: string) {
    return this.matchesService.getMatchById(matchId);
  }
}
