import { Injectable } from '@nestjs/common';
import { BaseRepository } from './repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { OddsEntity } from '../entities/matches';
import { IOddsRepository } from '../i-repositories';

@Injectable()
export class OddsRepository
  extends BaseRepository<OddsEntity>
  implements IOddsRepository
{
  protected readonly _repository: Repository<OddsEntity>;
  protected readonly _entityManager: EntityManager;

  constructor(
    @InjectRepository(OddsEntity)
    repository: Repository<OddsEntity>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);

    this._repository = repository;
    this._entityManager = entityManager;
  }
}
