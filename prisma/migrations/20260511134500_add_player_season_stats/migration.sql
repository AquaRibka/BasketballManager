CREATE TABLE "PlayerSeasonStat" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "seasonId" TEXT,
  "seasonLabel" VARCHAR(40) NOT NULL,
  "teamId" TEXT,
  "league" VARCHAR(80) NOT NULL,
  "gamesPlayed" INTEGER NOT NULL,
  "gamesStarted" INTEGER NOT NULL,
  "minutesPerGame" DOUBLE PRECISION NOT NULL,
  "pointsPerGame" DOUBLE PRECISION NOT NULL,
  "reboundsPerGame" DOUBLE PRECISION NOT NULL,
  "assistsPerGame" DOUBLE PRECISION NOT NULL,
  "stealsPerGame" DOUBLE PRECISION NOT NULL,
  "blocksPerGame" DOUBLE PRECISION NOT NULL,
  "turnoversPerGame" DOUBLE PRECISION NOT NULL,
  "foulsPerGame" DOUBLE PRECISION NOT NULL,
  "fgPct" DOUBLE PRECISION NOT NULL,
  "threePct" DOUBLE PRECISION NOT NULL,
  "ftPct" DOUBLE PRECISION NOT NULL,
  "efficiencyRating" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlayerSeasonStat_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlayerSeasonStat_playerId_seasonLabel_idx" ON "PlayerSeasonStat"("playerId", "seasonLabel");
CREATE INDEX "PlayerSeasonStat_seasonId_idx" ON "PlayerSeasonStat"("seasonId");
CREATE INDEX "PlayerSeasonStat_teamId_idx" ON "PlayerSeasonStat"("teamId");

ALTER TABLE "PlayerSeasonStat"
ADD CONSTRAINT "PlayerSeasonStat_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlayerSeasonStat"
ADD CONSTRAINT "PlayerSeasonStat_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlayerSeasonStat"
ADD CONSTRAINT "PlayerSeasonStat_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlayerSeasonStat"
ADD CONSTRAINT "PlayerSeasonStat_gamesPlayed_range" CHECK ("gamesPlayed" BETWEEN 0 AND 82),
ADD CONSTRAINT "PlayerSeasonStat_gamesStarted_range" CHECK ("gamesStarted" BETWEEN 0 AND 82),
ADD CONSTRAINT "PlayerSeasonStat_gamesStarted_order" CHECK ("gamesStarted" <= "gamesPlayed"),
ADD CONSTRAINT "PlayerSeasonStat_minutesPerGame_range" CHECK ("minutesPerGame" BETWEEN 0 AND 60),
ADD CONSTRAINT "PlayerSeasonStat_pointsPerGame_range" CHECK ("pointsPerGame" BETWEEN 0 AND 100),
ADD CONSTRAINT "PlayerSeasonStat_reboundsPerGame_range" CHECK ("reboundsPerGame" BETWEEN 0 AND 50),
ADD CONSTRAINT "PlayerSeasonStat_assistsPerGame_range" CHECK ("assistsPerGame" BETWEEN 0 AND 30),
ADD CONSTRAINT "PlayerSeasonStat_stealsPerGame_range" CHECK ("stealsPerGame" BETWEEN 0 AND 10),
ADD CONSTRAINT "PlayerSeasonStat_blocksPerGame_range" CHECK ("blocksPerGame" BETWEEN 0 AND 10),
ADD CONSTRAINT "PlayerSeasonStat_turnoversPerGame_range" CHECK ("turnoversPerGame" BETWEEN 0 AND 15),
ADD CONSTRAINT "PlayerSeasonStat_foulsPerGame_range" CHECK ("foulsPerGame" BETWEEN 0 AND 10),
ADD CONSTRAINT "PlayerSeasonStat_fgPct_range" CHECK ("fgPct" BETWEEN 0 AND 100),
ADD CONSTRAINT "PlayerSeasonStat_threePct_range" CHECK ("threePct" BETWEEN 0 AND 100),
ADD CONSTRAINT "PlayerSeasonStat_ftPct_range" CHECK ("ftPct" BETWEEN 0 AND 100),
ADD CONSTRAINT "PlayerSeasonStat_efficiencyRating_range" CHECK ("efficiencyRating" BETWEEN 0 AND 100);

INSERT INTO "PlayerSeasonStat" (
  "id",
  "playerId",
  "seasonLabel",
  "teamId",
  "league",
  "gamesPlayed",
  "gamesStarted",
  "minutesPerGame",
  "pointsPerGame",
  "reboundsPerGame",
  "assistsPerGame",
  "stealsPerGame",
  "blocksPerGame",
  "turnoversPerGame",
  "foulsPerGame",
  "fgPct",
  "threePct",
  "ftPct",
  "efficiencyRating",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('pstat_', md5(p."id" || clock_timestamp()::text || random()::text)),
  p."id",
  CASE
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 7
      THEN CONCAT(EXTRACT(YEAR FROM CURRENT_DATE)::INT, '/', LPAD(((EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1) % 100)::TEXT, 2, '0'))
    ELSE CONCAT((EXTRACT(YEAR FROM CURRENT_DATE)::INT - 1), '/', LPAD((EXTRACT(YEAR FROM CURRENT_DATE)::INT % 100)::TEXT, 2, '0'))
  END,
  p."teamId",
  'VTB United League',
  LEAST(44, GREATEST(12, ROUND(18 + p."overall" * 0.22 + CASE WHEN p."teamId" IS NULL THEN 0 ELSE 5 END))),
  LEAST(
    LEAST(44, GREATEST(12, ROUND(18 + p."overall" * 0.22 + CASE WHEN p."teamId" IS NULL THEN 0 ELSE 5 END))),
    GREATEST(0, ROUND((18 + p."overall" * 0.22) * CASE WHEN p."overall" >= 78 THEN 0.7 WHEN p."overall" >= 70 THEN 0.38 ELSE 0.12 END))
  ),
  ROUND(LEAST(34, GREATEST(8, 10 + p."overall" * 0.22 + p."athleticism" * 0.05))::numeric, 1)::double precision,
  ROUND(LEAST(26, GREATEST(2, p."shooting" * 0.11 + p."overall" * 0.045))::numeric, 1)::double precision,
  ROUND(LEAST(13, GREATEST(1, p."rebounding" * 0.075 + 1.3))::numeric, 1)::double precision,
  ROUND(LEAST(10, GREATEST(0.5, p."passing" * 0.065 + 0.9))::numeric, 1)::double precision,
  ROUND(LEAST(2.8, GREATEST(0.2, p."defense" * 0.012 + 0.3))::numeric, 1)::double precision,
  ROUND(LEAST(2.7, GREATEST(0.1, CASE WHEN p."position" IN ('C', 'PF') THEN 0.7 ELSE 0.2 END + p."defense" * 0.006))::numeric, 1)::double precision,
  ROUND(LEAST(4.8, GREATEST(0.5, p."passing" * 0.018 + 0.8))::numeric, 1)::double precision,
  ROUND(LEAST(4.8, GREATEST(1.0, 1.2 + p."defense" * 0.012))::numeric, 1)::double precision,
  ROUND(LEAST(64, GREATEST(36, 38 + p."shooting" * 0.16))::numeric, 1)::double precision,
  ROUND(LEAST(49, GREATEST(24, 26 + p."shooting" * 0.13))::numeric, 1)::double precision,
  ROUND(LEAST(94, GREATEST(55, 58 + p."shooting" * 0.24))::numeric, 1)::double precision,
  ROUND(LEAST(34, GREATEST(4, (p."overall" * 0.12 + p."shooting" * 0.06 + p."passing" * 0.04 + p."rebounding" * 0.04 + p."defense" * 0.03)))::numeric, 1)::double precision,
  p."createdAt",
  p."updatedAt"
FROM "Player" p
LEFT JOIN "PlayerSeasonStat" pss ON pss."playerId" = p."id"
WHERE pss."id" IS NULL;
