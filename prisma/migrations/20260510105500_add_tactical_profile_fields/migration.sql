-- AlterTable
ALTER TABLE "PlayerTacticalAttributes"
ADD COLUMN "courtVision" INTEGER,
ADD COLUMN "defenseReading" INTEGER,
ADD COLUMN "offenseReading" INTEGER,
ADD COLUMN "offBallMovement" INTEGER,
ADD COLUMN "spacing" INTEGER,
ADD COLUMN "pickAndRollOffense" INTEGER,
ADD COLUMN "pickAndRollDefense" INTEGER,
ADD COLUMN "helpDefense" INTEGER,
ADD COLUMN "discipline" INTEGER;

-- Backfill from existing tactical values
UPDATE "PlayerTacticalAttributes"
SET
  "courtVision" = COALESCE("courtVision", GREATEST(1, LEAST(100, ROUND(("basketballIQ" + "decisionMaking") / 2.0)))),
  "defenseReading" = COALESCE("defenseReading", GREATEST(1, LEAST(100, "helpDefenseAwareness"))),
  "offenseReading" = COALESCE("offenseReading", GREATEST(1, LEAST(100, "pickAndRollRead"))),
  "offBallMovement" = COALESCE("offBallMovement", GREATEST(1, LEAST(100, "offBallAwareness"))),
  "spacing" = COALESCE("spacing", GREATEST(1, LEAST(100, "spacingSense"))),
  "pickAndRollOffense" = COALESCE("pickAndRollOffense", GREATEST(1, LEAST(100, "pickAndRollRead"))),
  "pickAndRollDefense" = COALESCE("pickAndRollDefense", GREATEST(1, LEAST(100, ROUND(("pickAndRollRead" + "helpDefenseAwareness") / 2.0)))),
  "helpDefense" = COALESCE("helpDefense", GREATEST(1, LEAST(100, "helpDefenseAwareness"))),
  "discipline" = COALESCE("discipline", GREATEST(1, LEAST(100, ROUND(("playDiscipline" + "foulDiscipline") / 2.0))))
WHERE
  "courtVision" IS NULL
  OR "defenseReading" IS NULL
  OR "offenseReading" IS NULL
  OR "offBallMovement" IS NULL
  OR "spacing" IS NULL
  OR "pickAndRollOffense" IS NULL
  OR "pickAndRollDefense" IS NULL
  OR "helpDefense" IS NULL
  OR "discipline" IS NULL;

ALTER TABLE "PlayerTacticalAttributes"
ALTER COLUMN "courtVision" SET NOT NULL,
ALTER COLUMN "defenseReading" SET NOT NULL,
ALTER COLUMN "offenseReading" SET NOT NULL,
ALTER COLUMN "offBallMovement" SET NOT NULL,
ALTER COLUMN "spacing" SET NOT NULL,
ALTER COLUMN "pickAndRollOffense" SET NOT NULL,
ALTER COLUMN "pickAndRollDefense" SET NOT NULL,
ALTER COLUMN "helpDefense" SET NOT NULL,
ALTER COLUMN "discipline" SET NOT NULL;

ALTER TABLE "PlayerTacticalAttributes"
ADD CONSTRAINT "PlayerTacticalAttributes_courtVision_range" CHECK ("courtVision" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_defenseReading_range" CHECK ("defenseReading" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_offenseReading_range" CHECK ("offenseReading" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_offBallMovement_range" CHECK ("offBallMovement" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_spacing_range" CHECK ("spacing" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_pickAndRollOffense_range" CHECK ("pickAndRollOffense" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_pickAndRollDefense_range" CHECK ("pickAndRollDefense" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_helpDefense_range" CHECK ("helpDefense" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_discipline_range" CHECK ("discipline" BETWEEN 1 AND 100);
