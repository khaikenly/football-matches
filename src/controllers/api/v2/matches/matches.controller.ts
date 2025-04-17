import { Controller, Get } from '@nestjs/common';

@Controller({
  version: '2',
  path: 'matches',
})
export class MatchesController {
  constructor() {}

  @Get()
  getMatches() {
    return {
      message: 'Matches v2',
    };
  }
}
