import { Module } from '@nestjs/common';
import { MatchesController } from './matches';
import { ServiceModule } from '@/services';
import { OddsController } from './odds';

@Module({
  imports: [ServiceModule],
  providers: [],
  controllers: [MatchesController, OddsController],
})
export class ControllerV1Module {}
