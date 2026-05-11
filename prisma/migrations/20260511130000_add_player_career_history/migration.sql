CREATE TYPE "PlayerCareerStatus" AS ENUM ('ACTIVE', 'FORMER', 'FREE_AGENT');

CREATE TABLE "PlayerCareerHistory" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "seasonId" TEXT,
  "seasonLabel" VARCHAR(40) NOT NULL,
  "teamId" TEXT,
  "league" VARCHAR(80) NOT NULL,
  "role" VARCHAR(80) NOT NULL,
  "jerseyNumber" INTEGER,
  "status" "PlayerCareerStatus" NOT NULL DEFAULT 'ACTIVE',
  "transferDate" TIMESTAMP(3),
  "transferReason" VARCHAR(120),
  "achievements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlayerCareerHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlayerCareerHistory_playerId_seasonLabel_idx" ON "PlayerCareerHistory"("playerId", "seasonLabel");
CREATE INDEX "PlayerCareerHistory_playerId_transferDate_idx" ON "PlayerCareerHistory"("playerId", "transferDate");
CREATE INDEX "PlayerCareerHistory_teamId_idx" ON "PlayerCareerHistory"("teamId");
CREATE INDEX "PlayerCareerHistory_seasonId_idx" ON "PlayerCareerHistory"("seasonId");

ALTER TABLE "PlayerCareerHistory"
ADD CONSTRAINT "PlayerCareerHistory_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlayerCareerHistory"
ADD CONSTRAINT "PlayerCareerHistory_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlayerCareerHistory"
ADD CONSTRAINT "PlayerCareerHistory_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "PlayerCareerHistory" (
  "id",
  "playerId",
  "seasonLabel",
  "teamId",
  "league",
  "role",
  "status",
  "transferDate",
  "transferReason",
  "achievements",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('hist_', md5(p."id" || clock_timestamp()::text || random()::text)),
  p."id",
  CASE
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 7
      THEN CONCAT(EXTRACT(YEAR FROM CURRENT_DATE)::INT, '/', LPAD(((EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1) % 100)::TEXT, 2, '0'))
    ELSE CONCAT((EXTRACT(YEAR FROM CURRENT_DATE)::INT - 1), '/', LPAD((EXTRACT(YEAR FROM CURRENT_DATE)::INT % 100)::TEXT, 2, '0'))
  END,
  p."teamId",
  'VTB United League',
  CASE WHEN p."teamId" IS NULL THEN 'Free Agent' ELSE 'Roster' END,
  CASE WHEN p."teamId" IS NULL THEN 'FREE_AGENT'::"PlayerCareerStatus" ELSE 'ACTIVE'::"PlayerCareerStatus" END,
  p."createdAt",
  CASE WHEN p."teamId" IS NULL THEN 'Created as free agent' ELSE 'Initial roster assignment' END,
  ARRAY[]::TEXT[],
  p."createdAt",
  p."updatedAt"
FROM "Player" AS p
LEFT JOIN "PlayerCareerHistory" AS pch ON pch."playerId" = p."id"
WHERE pch."id" IS NULL;
