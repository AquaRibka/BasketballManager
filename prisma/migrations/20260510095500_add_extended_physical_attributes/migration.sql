-- AlterTable
ALTER TABLE "PlayerPhysicalProfile"
ADD COLUMN "balance" INTEGER,
ADD COLUMN "coordination" INTEGER,
ADD COLUMN "explosiveness" INTEGER,
ADD COLUMN "reaction" INTEGER,
ADD COLUMN "recovery" INTEGER;

-- Backfill
UPDATE "PlayerPhysicalProfile"
SET
  "explosiveness" = GREATEST(1, LEAST(100, "acceleration" + 2)),
  "balance" = GREATEST(1, LEAST(100, "agility" + 1)),
  "coordination" = GREATEST(1, LEAST(100, "agility" + 2)),
  "reaction" = GREATEST(1, LEAST(100, "acceleration" + 1)),
  "recovery" = GREATEST(1, LEAST(100, "endurance" + 2))
WHERE
  "balance" IS NULL
  OR "coordination" IS NULL
  OR "explosiveness" IS NULL
  OR "reaction" IS NULL
  OR "recovery" IS NULL;

-- Make columns required
ALTER TABLE "PlayerPhysicalProfile"
ALTER COLUMN "balance" SET NOT NULL,
ALTER COLUMN "coordination" SET NOT NULL,
ALTER COLUMN "explosiveness" SET NOT NULL,
ALTER COLUMN "reaction" SET NOT NULL,
ALTER COLUMN "recovery" SET NOT NULL;

-- Constraints
ALTER TABLE "PlayerPhysicalProfile"
ADD CONSTRAINT "PlayerPhysicalProfile_balance_range" CHECK ("balance" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_coordination_range" CHECK ("coordination" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_explosiveness_range" CHECK ("explosiveness" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_reaction_range" CHECK ("reaction" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_recovery_range" CHECK ("recovery" BETWEEN 1 AND 100);
