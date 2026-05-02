-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "winnerTeamId" TEXT,
    "playedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- AddForeignKey
ALTER TABLE "Match"
ADD CONSTRAINT "Match_homeTeamId_fkey"
FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match"
ADD CONSTRAINT "Match_awayTeamId_fkey"
FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Match constraints
ALTER TABLE "Match"
ADD CONSTRAINT "Match_distinct_teams" CHECK ("homeTeamId" <> "awayTeamId"),
ADD CONSTRAINT "Match_non_negative_home_score" CHECK ("homeScore" IS NULL OR "homeScore" >= 0),
ADD CONSTRAINT "Match_non_negative_away_score" CHECK ("awayScore" IS NULL OR "awayScore" >= 0),
ADD CONSTRAINT "Match_completed_has_scores" CHECK (
  ("status" = 'SCHEDULED' AND "homeScore" IS NULL AND "awayScore" IS NULL AND "playedAt" IS NULL)
  OR
  ("status" = 'COMPLETED' AND "homeScore" IS NOT NULL AND "awayScore" IS NOT NULL AND "playedAt" IS NOT NULL)
),
ADD CONSTRAINT "Match_winner_consistency" CHECK (
  "winnerTeamId" IS NULL
  OR "winnerTeamId" = "homeTeamId"
  OR "winnerTeamId" = "awayTeamId"
),
ADD CONSTRAINT "Match_no_draws" CHECK (
  "homeScore" IS NULL
  OR "awayScore" IS NULL
  OR "homeScore" <> "awayScore"
);
