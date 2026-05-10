-- Add missing hidden-style profile fields.
ALTER TABLE "PlayerHiddenAttributes"
ADD COLUMN "importantMatches" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN "wantsToLeave" INTEGER NOT NULL DEFAULT 28;

ALTER TABLE "PlayerPotentialProfile"
ADD COLUMN "currentAbility" INTEGER NOT NULL DEFAULT 60;

ALTER TABLE "PlayerReputationProfile"
ADD COLUMN "hiddenReputation" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "mediaAppeal" INTEGER NOT NULL DEFAULT 60;

-- Backfill from existing player and profile data.
UPDATE "PlayerHiddenAttributes" AS pha
SET
  "importantMatches" = LEAST(100, GREATEST(1, ROUND((pha."pressureHandling" + pha."resilience") / 2.0))),
  "wantsToLeave" = LEAST(100, GREATEST(1, ROUND((100 - pma."loyalty" + pma."ego") / 2.0)))
FROM "PlayerMentalAttributes" AS pma
WHERE pma."playerId" = pha."playerId";

UPDATE "PlayerPotentialProfile" AS ppp
SET "currentAbility" = LEAST(100, GREATEST(1, p."overall"))
FROM "Player" AS p
WHERE p."id" = ppp."playerId";

UPDATE "PlayerReputationProfile" AS prp
SET
  "hiddenReputation" = LEAST(100, GREATEST(1, prp."reputation")),
  "mediaAppeal" = LEAST(
    100,
    GREATEST(1, ROUND((prp."starPower" + prp."fanAppeal" + prp."mediaHandling") / 3.0))
  );

ALTER TABLE "PlayerHiddenAttributes"
ALTER COLUMN "importantMatches" DROP DEFAULT,
ALTER COLUMN "wantsToLeave" DROP DEFAULT;

ALTER TABLE "PlayerPotentialProfile"
ALTER COLUMN "currentAbility" DROP DEFAULT;

ALTER TABLE "PlayerReputationProfile"
ALTER COLUMN "hiddenReputation" DROP DEFAULT,
ALTER COLUMN "mediaAppeal" DROP DEFAULT;

ALTER TABLE "PlayerHiddenAttributes"
ADD CONSTRAINT "PlayerHiddenAttributes_importantMatches_range" CHECK ("importantMatches" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_wantsToLeave_range" CHECK ("wantsToLeave" BETWEEN 1 AND 100);

ALTER TABLE "PlayerPotentialProfile"
ADD CONSTRAINT "PlayerPotentialProfile_currentAbility_range" CHECK ("currentAbility" BETWEEN 1 AND 100);

ALTER TABLE "PlayerReputationProfile"
ADD CONSTRAINT "PlayerReputationProfile_hiddenReputation_range" CHECK ("hiddenReputation" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerReputationProfile_mediaAppeal_range" CHECK ("mediaAppeal" BETWEEN 1 AND 100);
