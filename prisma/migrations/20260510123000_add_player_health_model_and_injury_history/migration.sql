DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlayerInjurySeverity') THEN
    CREATE TYPE "PlayerInjurySeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'SEVERE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlayerInjuryStatus') THEN
    CREATE TYPE "PlayerInjuryStatus" AS ENUM ('ACTIVE', 'RECOVERING', 'RECOVERED');
  END IF;
END $$;

ALTER TABLE "PlayerHealthProfile"
ADD COLUMN IF NOT EXISTS "overallCondition" INTEGER NOT NULL DEFAULT 82,
ADD COLUMN IF NOT EXISTS "fatigue" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN IF NOT EXISTS "postInjuryCondition" INTEGER NOT NULL DEFAULT 100;

UPDATE "PlayerHealthProfile"
SET
  "overallCondition" = LEAST(100, GREATEST(1, COALESCE("matchFitness", 82))),
  "fatigue" = LEAST(100, GREATEST(1, COALESCE("fatigueBase", 18))),
  "postInjuryCondition" = 100;

ALTER TABLE "PlayerHealthProfile"
ALTER COLUMN "overallCondition" DROP DEFAULT,
ALTER COLUMN "fatigue" DROP DEFAULT,
ALTER COLUMN "postInjuryCondition" DROP DEFAULT;

INSERT INTO "PlayerHealthProfile" (
  "id",
  "playerId",
  "overallCondition",
  "fatigue",
  "postInjuryCondition",
  "durability",
  "recoveryRate",
  "injuryRisk",
  "fatigueBase",
  "matchFitness",
  "painTolerance",
  "medicalOutlook",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('health_', p."id"),
  p."id",
  LEAST(100, GREATEST(1, p."overall")),
  18,
  100,
  LEAST(100, GREATEST(1, 68 + GREATEST(0, p."age" - 24))),
  LEAST(100, GREATEST(1, 72 + ROUND(p."athleticism" / 8.0))),
  LEAST(100, GREATEST(1, 38 + GREATEST(0, p."age" - 28) - ROUND(p."athleticism" / 10.0))),
  20,
  LEAST(100, GREATEST(1, p."overall")),
  70,
  72,
  NOW(),
  NOW()
FROM "Player" AS p
LEFT JOIN "PlayerHealthProfile" AS php ON php."playerId" = p."id"
WHERE php."playerId" IS NULL;

CREATE TABLE IF NOT EXISTS "PlayerInjuryHistory" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "bodyPart" VARCHAR(80) NOT NULL,
  "severity" "PlayerInjurySeverity" NOT NULL,
  "status" "PlayerInjuryStatus" NOT NULL DEFAULT 'RECOVERED',
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "expectedReturnAt" TIMESTAMP(3),
  "returnedAt" TIMESTAMP(3),
  "gamesMissed" INTEGER NOT NULL DEFAULT 0,
  "notes" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlayerInjuryHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PlayerInjuryHistory_playerId_occurredAt_idx"
ON "PlayerInjuryHistory"("playerId", "occurredAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PlayerInjuryHistory_playerId_fkey'
  ) THEN
    ALTER TABLE "PlayerInjuryHistory"
    ADD CONSTRAINT "PlayerInjuryHistory_playerId_fkey"
    FOREIGN KEY ("playerId") REFERENCES "Player"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlayerHealthProfile_overallCondition_range'
  ) THEN
    ALTER TABLE "PlayerHealthProfile"
    ADD CONSTRAINT "PlayerHealthProfile_overallCondition_range"
    CHECK ("overallCondition" BETWEEN 1 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlayerHealthProfile_fatigue_range'
  ) THEN
    ALTER TABLE "PlayerHealthProfile"
    ADD CONSTRAINT "PlayerHealthProfile_fatigue_range"
    CHECK ("fatigue" BETWEEN 1 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlayerHealthProfile_postInjuryCondition_range'
  ) THEN
    ALTER TABLE "PlayerHealthProfile"
    ADD CONSTRAINT "PlayerHealthProfile_postInjuryCondition_range"
    CHECK ("postInjuryCondition" BETWEEN 1 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlayerInjuryHistory_gamesMissed_range'
  ) THEN
    ALTER TABLE "PlayerInjuryHistory"
    ADD CONSTRAINT "PlayerInjuryHistory_gamesMissed_range"
    CHECK ("gamesMissed" >= 0);
  END IF;
END $$;
