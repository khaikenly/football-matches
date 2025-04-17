import { Module } from '@nestjs/common';
import { ControllerV1Module } from './api/v1';
import { ControllerV2Module } from './api/v2';

@Module({
  imports: [ControllerV1Module, ControllerV2Module],
})
export class ControllerModule {}
