import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueEntity } from '../entities/leagues';
import { MatchEntity, OddsEntity } from '../entities/matches';
import {
  ILeagueRepository,
  IMatchRepository,
  IOddsRepository,
} from '../i-repositories';
import { LeagueRepository } from './league.repository';
import { MatchRepository } from './match.repository';
import { OddsRepository } from './odds.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeagueEntity, MatchEntity, OddsEntity])],
  providers: [
    {
      provide: ILeagueRepository,
      useClass: LeagueRepository,
    },
    {
      provide: IMatchRepository,
      useClass: MatchRepository,
    },
    {
      provide: IOddsRepository,
      useClass: OddsRepository,
    },
  ],
  exports: [ILeagueRepository, IMatchRepository, IOddsRepository],
})
export class RepositoryModule {}
