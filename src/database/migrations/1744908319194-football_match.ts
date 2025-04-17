import { MigrationInterface, QueryRunner } from 'typeorm';

export class FootballMatch1744908319194 implements MigrationInterface {
  name = 'FootballMatch1744908319194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "odds" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "supplierName" character varying(255) NOT NULL,
                "live" jsonb,
                "histories" jsonb,
                "active_exchange_back" boolean NOT NULL DEFAULT false,
                "active_exchange_lay" boolean NOT NULL DEFAULT false,
                "live_exchange_back" jsonb,
                "live_exchange_lay" jsonb,
                "history_exchange_back" jsonb,
                "history_exchange_lay" jsonb,
                "match_id" integer,
                CONSTRAINT "UQ_b89de4eb9a77209d2bf73dc09e5" UNIQUE ("uuid"),
                CONSTRAINT "PK_697d4239339fed10db401b509d1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "matches" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "matchId" character varying(255) NOT NULL,
                "date" character varying(255) NOT NULL,
                "link" character varying(255) NOT NULL,
                "title" character varying(255) NOT NULL,
                "time" character varying(255) NOT NULL,
                "homeTeam" character varying(255) NOT NULL,
                "awayTeam" character varying(255) NOT NULL,
                "league_id" integer,
                CONSTRAINT "UQ_f1c2e30a1dbb4fffe2680746161" UNIQUE ("uuid"),
                CONSTRAINT "UQ_00f0b0a807779364b0671ff5a35" UNIQUE ("matchId"),
                CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "leagues" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "leagueId" character varying(255) NOT NULL,
                "leagueName" character varying(255) NOT NULL,
                "countryName" character varying(255),
                "leagueLink" character varying(255) NOT NULL,
                CONSTRAINT "UQ_147dc4e3637a77c38d8d0ddbbf4" UNIQUE ("uuid"),
                CONSTRAINT "UQ_23f9c840d7f7f0b860abea8b995" UNIQUE ("leagueId"),
                CONSTRAINT "PK_2275e1e3e32e9223298c3a0b514" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "odds"
            ADD CONSTRAINT "FK_827f9ac2b51c150445c2375f489" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "matches"
            ADD CONSTRAINT "FK_5259df4c649a6a78a55d8761de5" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matches" DROP CONSTRAINT "FK_5259df4c649a6a78a55d8761de5"
        `);
    await queryRunner.query(`
            ALTER TABLE "odds" DROP CONSTRAINT "FK_827f9ac2b51c150445c2375f489"
        `);
    await queryRunner.query(`
            DROP TABLE "leagues"
        `);
    await queryRunner.query(`
            DROP TABLE "matches"
        `);
    await queryRunner.query(`
            DROP TABLE "odds"
        `);
  }
}
