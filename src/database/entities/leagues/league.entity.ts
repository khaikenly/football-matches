import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { MatchEntity } from '../matches';

@Entity({
  name: 'leagues',
})
export class LeagueEntity extends AbstractEntity<LeagueEntity> {
  @Column({ type: 'varchar', length: 255, unique: true })
  leagueId: string;

  @Column({ type: 'varchar', length: 255 })
  leagueName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  countryName?: string;

  @Column({ type: 'varchar', length: 255 })
  leagueLink: string;

  @OneToMany(() => MatchEntity, (match) => match.league, {
    cascade: ['insert', 'update', 'soft-remove'],
  })
  matches: Array<MatchEntity>;
}
