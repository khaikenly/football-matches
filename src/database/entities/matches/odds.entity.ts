import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { MatchEntity } from './match.entity';

export interface IOddsSnapshotProps {
  uid: string;
  updated: string;
  '1': number;
  X: number;
  '2': number;
}

export interface IOddsExchangeSnapshotProps extends IOddsSnapshotProps {
  amount_1: number;
  amount_X: number;
  amount_2: number;
}

@Entity({
  name: 'odds',
})
export class OddsEntity extends AbstractEntity<OddsEntity> {
  @Column({ type: 'varchar', length: 255 })
  supplierName: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  live?: IOddsSnapshotProps;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  histories?: IOddsSnapshotProps[];

  @Column({
    name: 'active_exchange_back',
    type: 'boolean',
    default: false,
  })
  activeExchangeBack: boolean;

  @Column({
    name: 'active_exchange_lay',
    type: 'boolean',
    default: false,
  })
  activeExchangeLay: boolean;

  @Column({
    name: 'live_exchange_back',
    type: 'jsonb',
    nullable: true,
  })
  liveExchangeBack?: IOddsExchangeSnapshotProps;

  @Column({
    name: 'live_exchange_lay',
    type: 'jsonb',
    nullable: true,
  })
  liveExchangeLay?: IOddsExchangeSnapshotProps;

  @Column({
    name: 'history_exchange_back',
    type: 'jsonb',
    nullable: true,
  })
  historyExchangeBack?: IOddsExchangeSnapshotProps;

  @Column({
    name: 'history_exchange_lay',
    type: 'jsonb',
    nullable: true,
  })
  historyExchangeLay?: IOddsExchangeSnapshotProps;

  @ManyToOne(() => MatchEntity, (match) => match.odds, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity;
}
