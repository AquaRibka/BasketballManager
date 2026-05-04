CREATE TABLE "MatchPlayerStat" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "rebounds" INTEGER NOT NULL DEFAULT 0,
  "assists" INTEGER NOT NULL DEFAULT 0,
  "steals" INTEGER NOT NULL DEFAULT 0,
  "blocks" INTEGER NOT NULL DEFAULT 0,
  "minutes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MatchPlayerStat_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MatchPlayerStat_matchId_playerId_key" ON "MatchPlayerStat"("matchId", "playerId");
CREATE INDEX "MatchPlayerStat_matchId_idx" ON "MatchPlayerStat"("matchId");
CREATE INDEX "MatchPlayerStat_playerId_idx" ON "MatchPlayerStat"("playerId");
CREATE INDEX "MatchPlayerStat_teamId_idx" ON "MatchPlayerStat"("teamId");

ALTER TABLE "MatchPlayerStat"
ADD CONSTRAINT "MatchPlayerStat_matchId_fkey"
FOREIGN KEY ("matchId") REFERENCES "Match"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatchPlayerStat"
ADD CONSTRAINT "MatchPlayerStat_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatchPlayerStat"
ADD CONSTRAINT "MatchPlayerStat_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatchPlayerStat"
ADD CONSTRAINT "MatchPlayerStat_non_negative_points" CHECK ("points" >= 0),
ADD CONSTRAINT "MatchPlayerStat_non_negative_rebounds" CHECK ("rebounds" >= 0),
ADD CONSTRAINT "MatchPlayerStat_non_negative_assists" CHECK ("assists" >= 0),
ADD CONSTRAINT "MatchPlayerStat_non_negative_steals" CHECK ("steals" >= 0),
ADD CONSTRAINT "MatchPlayerStat_non_negative_blocks" CHECK ("blocks" >= 0),
ADD CONSTRAINT "MatchPlayerStat_minutes_range" CHECK ("minutes" >= 0 AND "minutes" <= 80);
