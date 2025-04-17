import { LeagueEntity } from '@/database/entities/leagues';
import { MatchEntity, OddsEntity } from '@/database/entities/matches';
import {
  ILeagueRepository,
  IMatchRepository,
  IOddsRepository,
} from '@/database/i-repositories';
import { ECatId } from '@/enum';
import { LeagueType, MatchType, OddsType } from '@/types';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as cheerio from 'cheerio';
import Redis from 'ioredis';
import { chunk, groupBy, uniqBy } from 'lodash';
import moment from 'moment';

@Injectable()
export class CrawlService implements OnModuleInit {
  protected readonly logger: Logger = new Logger(CrawlService.name);
  private readonly URL: string;
  private readonly CRAWL_API_URL: string;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _httpService: HttpService,

    @InjectRedis() private readonly _cache: Redis,
    @Inject(ILeagueRepository)
    private readonly _leagueRepository: ILeagueRepository,
    @Inject(IMatchRepository)
    private readonly _matchRepository: IMatchRepository,
    @Inject(IOddsRepository)
    private readonly _oddsRepository: IOddsRepository,
  ) {
    this.URL =
      this._configService.get<string>('CRAWL_URL') ||
      'https://www.oddsmath.com';
    this.CRAWL_API_URL =
      this._configService.get<string>('CRAWL_API_URL') ||
      'https://www.oddsmath.com/api/v1';
  }

  async onModuleInit() {
    this.logger.verbose('CrawlService initialized');
    // Start the crawling process
    await this.crawlFootballMatches();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async crawlFootballMatches() {
    try {
      this.logger.verbose('Crawl started');
      const defaultDate = 'today';
      const url = `${this.URL}/football/matches/${defaultDate}`;
      this.logger.verbose(`Crawling URL: ${this.URL}`);

      // make a request to the URL
      const response = await this._httpService.axiosRef.get(url);

      if (response.status !== 200) {
        this.logger.error('Crawl failed', response.statusText);
        return;
      }

      this.logger.verbose('Crawl successful');
      const data = response.data;
      // parse the HTML and extract events information
      const events = this.parseEvents(data);
      if (!events.length) return;

      // prepare the data for each event
      const leaguesData: Array<LeagueType> = [];
      const matchesData: {
        leagueId: string;
        matches: MatchType[];
      }[] = [];
      for (const event of events) {
        this.logger.verbose(
          `Event ID: ${event.id}, Data Value: ${event.dataValue}, Link: ${event.link}, Title: ${event.title}`,
        );

        // Soccer Odds
        const oddsUrl = `${this.URL}/football/matches/${event.dataValue}`;
        const oddsResponse = await this._httpService.axiosRef.get(oddsUrl);
        if (oddsResponse.status !== 200) {
          this.logger.error('Crawl failed', oddsResponse.statusText);
          return;
        }
        const oddsData = oddsResponse.data;
        const { leagues, matches } = this.parseMatches(
          oddsData,
          event.dataValue,
        );
        if (!leagues.length) continue;
        leaguesData.push(...leagues);
        matchesData.push(...matches);
      }

      // save to cache ids matches to live data details
      const matchIdsToLive = matchesData
        .map((item) => item.matches)
        .flat()
        .map((item) =>
          JSON.stringify({
            matchId: item.matchId,
            leagueId: item.leagueId,
          }),
        );
      const matchIdsToLiveKey = `matchIdsToLive`;
      await this._cache.set(matchIdsToLiveKey, matchIdsToLive.toString());

      let leagueEntities: LeagueEntity[] = [];
      for (const league of leaguesData) {
        const isExists = await this._leagueRepository.findOne({
          leagueId: league.leagueId,
        });
        if (isExists) continue;

        const leagueEntity = new LeagueEntity();
        leagueEntity.leagueId = league.leagueId;
        leagueEntity.leagueName = league.leagueName;
        leagueEntity.countryName = league.countryName;
        leagueEntity.leagueLink = league.leagueLink;

        leagueEntities.push(leagueEntity);
      }

      // save leagues to database
      leagueEntities = uniqBy(leagueEntities, 'leagueId');
      if (leagueEntities.length)
        await this._leagueRepository.save(leagueEntities);

      // save matches to database
      await this.prepareMatches();

      return events;
    } catch (error) {
      this.logger.error('Crawl failed', error);
    }
  }

  /**
   * Parses the HTML data and extracts events information
   *
   * @
   * param data HTML data to parse
   * @returns {Array} Array of events information
   */
  private parseEvents(data: string) {
    try {
      this.logger.verbose('Parse started');
      const $ = cheerio.load(data);

      // Get Events By - days_games
      const eventsBy = $('#days_games');
      const eventsByList = eventsBy.find('ul.bullet');
      const eventsByItems = eventsByList.find('li.item');
      const eventsByData: Array<{
        id: string;
        dataValue: string;
        link: string;
        title: string;
      }> = eventsByItems
        .map((_, element) => {
          const item = $(element);
          const id = item.attr('id');
          const dataValue = item.attr('data-value');
          const link = item.find('a').attr('href');
          const title = item.find('a').text();
          return {
            id,
            dataValue,
            link,
            title,
          };
        })
        .get();
      this.logger.verbose(
        'Events parsed successfully',
        JSON.stringify(eventsByData),
      );

      return eventsByData;
    } catch (error) {
      this.logger.error('Parse failed', error);
      return [];
    }
  }

  private parseMatches(data: string, date: string) {
    const leagues: Array<LeagueType> = [];
    const matches: {
      leagueId: string;
      matches: MatchType[];
    }[] = [];
    try {
      this.logger.verbose('Parse started');
      const $ = cheerio.load(data);
      const eventsBy = $(`#events-by-day-${date}`);

      // Get Leagues By - tablesorter-no-sort
      const leaguesByList = eventsBy.find('tbody.tablesorter-no-sort');
      const leaguesByItems = leaguesByList.find('tr');
      leagues.push(
        ...leaguesByItems
          .map((_, element) => {
            const item = $(element);
            const leagueName = item.find('span.league_name a').text();
            const countryName = item.find('span.country_name a').text();
            const leagueId = item.parent().attr('data-x-id');
            const leagueLink = item.find('span.league_name a').attr('href');
            return {
              leagueName,
              countryName,
              leagueId,
              leagueLink,
            };
          })
          .get(),
      );

      if (!leagues.length) {
        this.logger.error('No leagues found');
        return { leagues: [], matches: [] };
      }

      // Get Matches By - sortable
      const matchesByList = eventsBy.find('tbody.sortable');
      const matchesByItems = matchesByList.find('tr');
      const matchesByData: Array<MatchType> = matchesByItems
        .map((_, element) => {
          const item = $(element);
          const matchId = item.attr('data-x-id');
          const link = item.find('a.event').attr('href');
          const title = item.find('a.event').text();
          const leagueId = item.parent().attr('data-x-group-id');
          const time = item.find('td.time').text().trim();
          const homeTeam = item.find('td.homeTeam a').text();
          const awayTeam = item.find('td.awayTeam a').text();
          const bkCount = item.find('td.bk-count').text();
          const odds1 = item.find('td.odds').eq(0).text();
          const oddsX = item.find('td.odds').eq(1).text();
          const odds2 = item.find('td.odds').eq(2).text();
          const margin = item.find('td.odds-margin').text();
          return {
            matchId,
            date: date,
            link,
            title,
            leagueId,
            time,
            homeTeam,
            awayTeam,
            bkCount,
            odds1,
            oddsX,
            odds2,
            margin,
          };
        })
        .get();

      if (!matchesByData.length) {
        this.logger.error('No matches found');
        return { leagues: [], matches: [] };
      }

      // Group matches by league
      const groupedMatches = groupBy(matchesByData, (item) => item.leagueId);
      matches.push(
        ...Object.entries(groupedMatches).map(([leagueId, matches]) => ({
          leagueId,
          matches,
        })),
      );

      this.logger.verbose('Matches parsed successfully');
      return { leagues, matches };
    } catch (error) {
      this.logger.error('Parse failed', error);
      return { leagues: [], matches: [] };
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async prepareMatches() {
    this.logger.verbose('Prepare matches started');

    const matchIdsToLiveKey = `matchIdsToLive`;
    const rawCache = await this._cache.get(matchIdsToLiveKey);
    const matchIdsToLiveArray: { matchId: string; leagueId: string }[] =
      JSON.parse(`[${rawCache}]`);

    const CONCURRENCY = 20; // xử lý 20 requests cùng lúc
    let matchEntities: MatchEntity[] = [];

    for (let i = 0; i < matchIdsToLiveArray.length; i += CONCURRENCY) {
      const batch = matchIdsToLiveArray.slice(i, i + CONCURRENCY);
      const batchPromises = batch.map(async (matchItems) => {
        try {
          const url = `${this.CRAWL_API_URL}/live-odds.json`;
          const response = await this._httpService.axiosRef.get(url, {
            params: {
              event_id: matchItems.matchId,
              cat_id: ECatId.FULL_TIME,
              include_exchanges: 1,
              language: 'en',
              country_code: 'VN',
            },
          });

          if (response.status !== 200 || !response.data) return null;

          const data = response.data;
          const league = await this._leagueRepository.findOne({
            leagueId: matchItems.leagueId,
          });

          if (!league) return null;

          const match = await this._matchRepository.findOne(
            {
              matchId: matchItems.matchId,
            },
            {
              odds: true,
            },
          );

          const oddsEntities: OddsEntity[] = [];

          for (const [sup, rawItem] of Object.entries(data.data)) {
            const item = rawItem as OddsType;
            const oddsEntity = new OddsEntity();
            oddsEntity.supplierName = sup;

            if (
              Object.hasOwnProperty.call(item, 'active_exchange_back') ||
              Object.hasOwnProperty.call(item, 'live_exchange_back')
            ) {
              oddsEntity.activeExchangeBack = item.active_exchange_back;
              oddsEntity.liveExchangeBack = item.live_exchange_back;
              oddsEntity.liveExchangeLay = item.live_exchange_lay;
              oddsEntity.historyExchangeBack = item.history_exchange_back;
              oddsEntity.historyExchangeLay = item.history_exchange_lay;
            } else {
              oddsEntity.live = item.live;
              oddsEntity.histories = item.history;
            }

            oddsEntities.push(oddsEntity);
          }

          if (match) {
            // Remove old odds
            await this._oddsRepository.remove(match.odds);
            // Save new odds
            match.odds = oddsEntities;
            await this._matchRepository.save(match);
            return null;
          } else {
            const matchEntity = new MatchEntity();
            matchEntity.matchId = matchItems.matchId;
            matchEntity.date = moment(data.event.time).format('YYYY-MM-DD');
            matchEntity.link = data.event.url;
            matchEntity.title = `${data.event?.hometeam?.name} vs ${data.event?.awayteam?.name}`;
            matchEntity.time = data.event.time;
            matchEntity.homeTeam = data.event?.hometeam?.name || '-';
            matchEntity.awayTeam = data.event?.awayteam?.name || '-';
            matchEntity.league = league;

            matchEntity.odds = oddsEntities;
            return matchEntity;
          }
        } catch (err) {
          this.logger.warn(`Failed to crawl match ${matchItems.matchId}`, err);
          return null;
        }
      });

      const settled = await Promise.allSettled(batchPromises);

      for (const res of settled) {
        if (res.status === 'fulfilled' && res.value) {
          matchEntities.push(res.value);
        }
      }

      this.logger.verbose(
        `Processed batch ${i / CONCURRENCY + 1}/${Math.ceil(matchIdsToLiveArray.length / CONCURRENCY)}`,
      );
    }
    this.logger.verbose(`Finished processing ${matchEntities.length} matches`);
    matchEntities = uniqBy(matchEntities, 'matchId');
    const CHUNK_SIZE = 100;
    const chunks = chunk(matchEntities, CHUNK_SIZE);

    for (let i = 0; i < chunks.length; i++) {
      const chunkPart = chunks[i];
      try {
        await this._matchRepository.save(chunkPart);
        this.logger.verbose(`Saved chunk ${i + 1}/${chunks.length}`);
      } catch (err) {
        console.error(err);
        this.logger.error(`Failed to save chunk ${i + 1}: ${err}`);
      }
    }

    this.logger.verbose(`✅ Saved total ${matchEntities.length} matches`);
    return matchEntities.length;
  }
}
