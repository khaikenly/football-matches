import {
  FindOptionsSelect,
  FindOptionsWhere,
  FindOptionsRelations,
  FindOptionsOrder,
  FindManyOptions,
  SaveOptions,
  DeepPartial,
  UpdateResult,
} from 'typeorm';

export interface IRepository<TEntity> {
  find(
    select: FindOptionsSelect<TEntity>,
    where: FindOptionsWhere<TEntity>[] | FindOptionsWhere<TEntity>,
    relations?: FindOptionsRelations<TEntity>,
    order?: FindOptionsOrder<TEntity>,
    take?: number,
    skip?: number,
  ): Promise<Array<TEntity>>;

  findAndCount(
    options?: FindManyOptions<TEntity>,
  ): Promise<[TEntity[], number]>;

  findOne(
    where: FindOptionsWhere<TEntity>[] | FindOptionsWhere<TEntity>,
    relations?: FindOptionsRelations<TEntity>,
    order?: FindOptionsOrder<TEntity>,
    withDeleted?: boolean,
  ): Promise<TEntity | null>;

  save(
    entities: TEntity[] | TEntity,
    options?: SaveOptions,
  ): Promise<TEntity[] | TEntity>;

  updateById(
    id: number,
    partialEntity: DeepPartial<TEntity>,
  ): Promise<TEntity | null>;

  softRemove(
    entitiesOrEntity: TEntity | TEntity[],
    options?: SaveOptions,
  ): Promise<TEntity | TEntity[]>;

  softDelete(where: FindOptionsWhere<TEntity>): Promise<UpdateResult>;

  remove(
    entitiesOrEntity: TEntity | TEntity[],
    options?: SaveOptions,
  ): Promise<TEntity | TEntity[]>;
}
