import { LeagueEntity } from '../entities/leagues';
import { IRepository } from './i-repository';

export const ILeagueRepository = Symbol('ILeagueRepository');
export interface ILeagueRepository extends IRepository<LeagueEntity> {}
