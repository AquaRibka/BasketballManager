CREATE TABLE "PlayerAward" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "seasonId" TEXT,
  "seasonLabel" VARCHAR(40) NOT NULL,
  "awardType" VARCHAR(80) NOT NULL,
  "league" VARCHAR(80) NOT NULL,
  "teamId" TEXT,
  "description" VARCHAR(240),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlayerAward_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlayerAward_playerId_seasonLabel_idx" ON "PlayerAward"("playerId", "seasonLabel");
CREATE INDEX "PlayerAward_seasonId_idx" ON "PlayerAward"("seasonId");
CREATE INDEX "PlayerAward_teamId_idx" ON "PlayerAward"("teamId");

ALTER TABLE "PlayerAward"
ADD CONSTRAINT "PlayerAward_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlayerAward"
ADD CONSTRAINT "PlayerAward_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlayerAward"
ADD CONSTRAINT "PlayerAward_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
