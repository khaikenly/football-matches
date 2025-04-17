import { Injectable } from '@nestjs/common';
import { BaseRepository } from './repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { LeagueEntity } from '../entities/leagues';
import { ILeagueRepository } from '../i-repositories';

@Injectable()
export class LeagueRepository
  extends BaseRepository<LeagueEntity>
  implements ILeagueRepository
{
  protected readonly _repository: Repository<LeagueEntity>;
  protected readonly _entityManager: EntityManager;

  constructor(
    @InjectRepository(LeagueEntity)
    repository: Repository<LeagueEntity>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);

    this._repository = repository;
    this._entityManager = entityManager;
  }
}
