import {
  IOddsExchangeSnapshotProps,
  IOddsSnapshotProps,
} from '@/database/entities/matches';

export type OddsType = {
  live?: IOddsSnapshotProps;
  history?: IOddsSnapshotProps[];
  active_exchange_lay: boolean;
  active_exchange_back: boolean;
  live_exchange_back: IOddsExchangeSnapshotProps;
  live_exchange_lay: IOddsExchangeSnapshotProps;
  history_exchange_back: IOddsExchangeSnapshotProps;
  history_exchange_lay: IOddsExchangeSnapshotProps;
};
