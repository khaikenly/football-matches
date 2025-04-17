import { IMatchRepository } from '@/database/i-repositories';
import {
  MatchFilterDto,
  PaginationDto,
  PaginationMetaDto,
  PaginationOptionsDto,
} from '@/dtos';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class MatchService {
  protected readonly logger: Logger = new Logger(MatchService.name);

  constructor(
    @Inject(IMatchRepository)
    private readonly _matchRepository: IMatchRepository,
  ) {}

  async getMatches(paginate: PaginationOptionsDto, filter: MatchFilterDto) {
    try {
      const [matches, counts] = await this._matchRepository.findAndCount({
        where: {
          ...(filter.date && {
            date: filter.date,
          }),
          ...(filter.leagueId && {
            league: {
              leagueId: filter.leagueId,
            },
          }),
        },
        relations: {
          league: true,
        },
        order: {
          matchId: paginate.orderBy,
        },
        take: paginate.take,
        skip: paginate.skip,
      });

      const paginateMeta = new PaginationMetaDto({
        paginationOptionsDto: paginate,
        itemCount: counts,
      });

      return new PaginationDto(matches, paginateMeta);
    } catch (error) {
      this.logger.error(`Error getting matches: ${error}`);
      throw new BadRequestException('Error getting matches');
    }
  }

  async getMatchById(matchId: string) {
    try {
      const match = await this._matchRepository.findOne(
        { matchId },
        {
          odds: true,
        },
      );
      if (!match) throw new BadRequestException('Match not found');

      return match?.toObject();
    } catch (error) {
      this.logger.error(`Error getting match by ID: ${error}`);
      throw new BadRequestException('Error getting match by ID');
    }
  }
}
