import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
  SaveOptions,
  UpdateResult,
} from 'typeorm';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { FindOptionsSelect } from 'typeorm/find-options/FindOptionsSelect';
import { AbstractEntity } from '../entities';
import { IRepository } from '../i-repositories';
import { keys, set } from 'lodash';

export abstract class BaseRepository<TEntity extends AbstractEntity<TEntity>>
  implements IRepository<TEntity>
{
  protected readonly _repository: Repository<TEntity>;
  protected readonly _entityManager: EntityManager;

  constructor(repository: Repository<TEntity>, entityManager: EntityManager) {
    this._repository = repository;
    this._entityManager = entityManager;
  }

  async find(
    select: FindOptionsSelect<TEntity>,
    where: FindOptionsWhere<TEntity>[] | FindOptionsWhere<TEntity>,
    relations?: FindOptionsRelations<TEntity>,
    order?: FindOptionsOrder<TEntity>,
    take?: number,
    skip?: number,
  ): Promise<Array<TEntity>> {
    return this._repository.find({
      select,
      where,
      relations,
      order,
      take,
      skip,
    });
  }

  async findAndCount(
    options?: FindManyOptions<TEntity>,
  ): Promise<[TEntity[], number]> {
    return this._repository.findAndCount(options);
  }

  async findOne(
    where: FindOptionsWhere<TEntity>[] | FindOptionsWhere<TEntity>,
    relations?: FindOptionsRelations<TEntity>,
    order?: FindOptionsOrder<TEntity>,
    withDeleted: boolean = false,
  ): Promise<TEntity | null> {
    return this._repository.findOne({ where, relations, order, withDeleted });
  }

  async save(
    entities: TEntity[] | TEntity,
    options?: SaveOptions,
  ): Promise<TEntity[] | TEntity> {
    return this._entityManager.save(entities, options);
  }

  async updateById(
    id: number,
    partialEntity: DeepPartial<TEntity>,
  ): Promise<TEntity | null> {
    const foundInstance = await this.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: id as any,
    });

    if (!foundInstance) return null;

    keys(partialEntity).forEach((key) => {
      set(foundInstance, key, partialEntity[key]);
    });

    return this._entityManager.save(foundInstance);
  }

  async softRemove(
    entitiesOrEntity: TEntity | TEntity[],
    options?: SaveOptions,
  ): Promise<TEntity | TEntity[]> {
    return this._entityManager.softRemove(entitiesOrEntity, options);
  }

  async softDelete(where: FindOptionsWhere<TEntity>): Promise<UpdateResult> {
    return this._repository.softDelete(where);
  }

  async remove(
    entitiesOrEntity: TEntity | TEntity[],
    options?: SaveOptions,
  ): Promise<TEntity | TEntity[]> {
    return this._entityManager.remove(entitiesOrEntity, options);
  }
}
