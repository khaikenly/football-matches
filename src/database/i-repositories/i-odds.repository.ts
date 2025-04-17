import { OddsEntity } from '../entities/matches';
import { IRepository } from './i-repository';

export const IOddsRepository = Symbol('IOddsRepository');
export interface IOddsRepository extends IRepository<OddsEntity> {}
