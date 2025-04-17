import { Module } from '@nestjs/common';
import { ControllerModule } from './controllers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import datasource, { typeormConfig } from './database/datasource';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Schedule config
    ScheduleModule.forRoot(),

    // Redis config
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get<number>(
          'REDIS_HOST',
        )}:${configService.get<number>('REDIS_PORT')}`,
        options: {
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    /**
     *  Database config
     */
    TypeOrmModule.forRootAsync({
      useFactory: async () => typeormConfig,
      dataSourceFactory: async () => {
        datasource.initialize();
        return datasource;
      },
    }),

    ControllerModule,
  ],
  providers: [],
})
export class AppModule {}
