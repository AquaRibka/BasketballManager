-- AlterTable
ALTER TABLE "PlayerMentalAttributes"
ADD COLUMN "selfControl" INTEGER,
ADD COLUMN "concentration" INTEGER,
ADD COLUMN "determination" INTEGER,
ADD COLUMN "aggressiveness" INTEGER,
ADD COLUMN "teamwork" INTEGER;

ALTER TABLE "PlayerHiddenAttributes"
ADD COLUMN "setbackResponse" INTEGER;

-- Backfill mental attributes
UPDATE "PlayerMentalAttributes"
SET
  "selfControl" = COALESCE("selfControl", GREATEST(1, LEAST(100, "composure"))),
  "concentration" = COALESCE("concentration", GREATEST(1, LEAST(100, ROUND(("composure" + "professionalism") / 2.0)))),
  "determination" = COALESCE("determination", GREATEST(1, LEAST(100, ROUND(("competitiveness" + "workEthic") / 2.0)))),
  "aggressiveness" = COALESCE("aggressiveness", GREATEST(1, LEAST(100, ROUND(("competitiveness" + "ego") / 2.0)))),
  "teamwork" = COALESCE("teamwork", GREATEST(1, LEAST(100, "teamOrientation")))
WHERE
  "selfControl" IS NULL
  OR "concentration" IS NULL
  OR "determination" IS NULL
  OR "aggressiveness" IS NULL
  OR "teamwork" IS NULL;

-- Backfill hidden attributes
UPDATE "PlayerHiddenAttributes"
SET "setbackResponse" = COALESCE("setbackResponse", GREATEST(1, LEAST(100, "resilience")))
WHERE "setbackResponse" IS NULL;

-- Make required
ALTER TABLE "PlayerMentalAttributes"
ALTER COLUMN "selfControl" SET NOT NULL,
ALTER COLUMN "concentration" SET NOT NULL,
ALTER COLUMN "determination" SET NOT NULL,
ALTER COLUMN "aggressiveness" SET NOT NULL,
ALTER COLUMN "teamwork" SET NOT NULL;

ALTER TABLE "PlayerHiddenAttributes"
ALTER COLUMN "setbackResponse" SET NOT NULL;

-- Constraints
ALTER TABLE "PlayerMentalAttributes"
ADD CONSTRAINT "PlayerMentalAttributes_selfControl_range" CHECK ("selfControl" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_concentration_range" CHECK ("concentration" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_determination_range" CHECK ("determination" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_aggressiveness_range" CHECK ("aggressiveness" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_teamwork_range" CHECK ("teamwork" BETWEEN 1 AND 100);

ALTER TABLE "PlayerHiddenAttributes"
ADD CONSTRAINT "PlayerHiddenAttributes_setbackResponse_range" CHECK ("setbackResponse" BETWEEN 1 AND 100);
