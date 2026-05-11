CREATE TYPE "PlayerDevelopmentFocus" AS ENUM (
  'BALANCED',
  'SCORING',
  'PLAYMAKING',
  'DEFENSE',
  'ATHLETICISM',
  'REBOUNDING'
);

ALTER TABLE "PlayerPotentialProfile"
ADD COLUMN "potentialAbility" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "developmentFocus" "PlayerDevelopmentFocus" NOT NULL DEFAULT 'BALANCED',
ADD COLUMN "peakStartAge" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN "peakEndAge" INTEGER NOT NULL DEFAULT 28,
ADD COLUMN "declineStartAge" INTEGER NOT NULL DEFAULT 31;

UPDATE "PlayerPotentialProfile"
SET
  "potentialAbility" = LEAST(100, GREATEST(1, "potential")),
  "peakStartAge" = LEAST(40, GREATEST(16, "peakWindowStart")),
  "peakEndAge" = LEAST(40, GREATEST(LEAST(40, GREATEST(16, "peakWindowStart")), "peakWindowEnd")),
  "declineStartAge" = LEAST(45, GREATEST("peakWindowEnd" + 1, "peakWindowEnd" + 3)),
  "developmentFocus" = 'BALANCED';

ALTER TABLE "PlayerPotentialProfile"
ALTER COLUMN "potentialAbility" DROP DEFAULT,
ALTER COLUMN "peakStartAge" DROP DEFAULT,
ALTER COLUMN "peakEndAge" DROP DEFAULT,
ALTER COLUMN "declineStartAge" DROP DEFAULT;

ALTER TABLE "PlayerPotentialProfile"
ADD CONSTRAINT "PlayerPotentialProfile_potentialAbility_range" CHECK ("potentialAbility" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPotentialProfile_peakStartAge_range" CHECK ("peakStartAge" BETWEEN 16 AND 40),
ADD CONSTRAINT "PlayerPotentialProfile_peakEndAge_range" CHECK ("peakEndAge" BETWEEN 16 AND 40),
ADD CONSTRAINT "PlayerPotentialProfile_declineStartAge_range" CHECK ("declineStartAge" BETWEEN 16 AND 45),
ADD CONSTRAINT "PlayerPotentialProfile_peakAge_order" CHECK ("peakStartAge" <= "peakEndAge"),
ADD CONSTRAINT "PlayerPotentialProfile_declineStartAge_order" CHECK ("peakEndAge" <= "declineStartAge");
