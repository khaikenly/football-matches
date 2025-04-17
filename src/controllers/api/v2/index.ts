import { Module } from '@nestjs/common';
import { MatchesController } from './matches';

@Module({
  imports: [],
  providers: [],
  controllers: [MatchesController],
})
export class ControllerV2Module {}
