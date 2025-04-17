import { envPath } from '@/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { LeagueEntity } from '../entities/leagues';
import { MatchEntity, OddsEntity } from '../entities/matches';

// get env file for migrations
dotenv.config({ path: envPath });
if (!process.env.SERVICE_NAME) {
  const migrationEnvPath = path.join(__dirname, '..', '.env');
  dotenv.config({ path: migrationEnvPath });
}
const configService = new ConfigService({});

export const typeormConfig: DataSourceOptions & TypeOrmModuleOptions = {
  entities: [LeagueEntity, MatchEntity, OddsEntity],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT') as string, 10),
  username: configService.get('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  migrationsRun: false,
  logging: false,
  migrationsTransactionMode: 'each',
  synchronize: false,
};

const datasource = new DataSource(typeormConfig);

export default datasource;
