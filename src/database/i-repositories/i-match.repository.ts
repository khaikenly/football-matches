import { MatchEntity } from '../entities/matches';
import { IRepository } from './i-repository';

export const IMatchRepository = Symbol('IMatchRepository');
export interface IMatchRepository extends IRepository<MatchEntity> {}
