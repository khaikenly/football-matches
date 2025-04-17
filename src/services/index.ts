import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CrawlService } from './crawl';
import { RepositoryModule } from '@/database/repositories';
import { MatchService } from './matches';

@Module({
  imports: [HttpModule, RepositoryModule],
  providers: [CrawlService, MatchService],
  exports: [CrawlService, MatchService],
})
export class ServiceModule {}
