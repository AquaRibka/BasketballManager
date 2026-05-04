CREATE TYPE "SeasonStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

CREATE TABLE "Season" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "year" INTEGER NOT NULL,
  "status" "SeasonStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "currentRound" INTEGER NOT NULL DEFAULT 1,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Season_status_idx" ON "Season"("status");
CREATE INDEX "Season_year_idx" ON "Season"("year");

INSERT INTO "Season" (
  "id",
  "name",
  "year",
  "status",
  "currentRound",
  "startedAt",
  "finishedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  source."seasonId",
  source."seasonId",
  COALESCE(
    NULLIF(substring(source."seasonId" from '([0-9]{4})$'), '')::INTEGER,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  ),
  'IN_PROGRESS'::"SeasonStatus",
  COALESCE(MAX(source."round"), 1),
  CURRENT_TIMESTAMP,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT "seasonId", "round"
  FROM "Match"
  WHERE "seasonId" IS NOT NULL

  UNION ALL

  SELECT "seasonId", NULL::INTEGER AS "round"
  FROM "Standing"
) AS source
GROUP BY source."seasonId";

ALTER TABLE "Match"
ADD CONSTRAINT "Match_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Standing"
ADD CONSTRAINT "Standing_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
