import { Injectable } from '@nestjs/common';
import { BaseRepository } from './repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { IMatchRepository } from '../i-repositories';
import { MatchEntity } from '../entities/matches';

@Injectable()
export class MatchRepository
  extends BaseRepository<MatchEntity>
  implements IMatchRepository
{
  protected readonly _repository: Repository<MatchEntity>;
  protected readonly _entityManager: EntityManager;

  constructor(
    @InjectRepository(MatchEntity)
    repository: Repository<MatchEntity>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);

    this._repository = repository;
    this._entityManager = entityManager;
  }
}
