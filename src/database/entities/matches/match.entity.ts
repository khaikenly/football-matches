import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { OddsEntity } from './odds.entity';
import { LeagueEntity } from '../leagues';

@Entity({
  name: 'matches',
})
export class MatchEntity extends AbstractEntity<MatchEntity> {
  @Column({ type: 'varchar', length: 255, unique: true })
  matchId: string;

  @Column({ type: 'varchar', length: 255 })
  date: string;

  @Column({ type: 'varchar', length: 255 })
  link: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  time: string;

  @Column({ type: 'varchar', length: 255 })
  homeTeam: string;

  @Column({ type: 'varchar', length: 255 })
  awayTeam: string;

  @ManyToOne(() => LeagueEntity, (league) => league.matches, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'league_id' })
  league: LeagueEntity;

  @OneToMany(() => OddsEntity, (odds) => odds.match, {
    cascade: ['insert', 'update', 'soft-remove'],
  })
  odds: OddsEntity[];
}
