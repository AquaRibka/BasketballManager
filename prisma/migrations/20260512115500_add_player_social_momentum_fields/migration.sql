ALTER TABLE "PlayerSocialProfile"
ADD COLUMN "followerGrowthWeekly" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "hypeScore" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "controversyScore" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN "marketabilityScore" INTEGER NOT NULL DEFAULT 50;

UPDATE "PlayerSocialProfile" psp
SET
  "followerGrowthWeekly" = ROUND(psp."followersCount" * 0.018)::INTEGER,
  "hypeScore" = LEAST(100, GREATEST(1, ROUND(pr."overall" * 0.86)::INTEGER)),
  "controversyScore" = LEAST(
    100,
    GREATEST(1, ROUND(18 + GREATEST(0, 78 - pr."overall") * 0.45)::INTEGER)
  ),
  "marketabilityScore" = LEAST(100, GREATEST(1, ROUND(pr."overall" * 0.82)::INTEGER))
FROM "Player" pr
WHERE pr."id" = psp."playerId";

ALTER TABLE "PlayerSocialProfile"
ADD CONSTRAINT "PlayerSocialProfile_hypeScore_range" CHECK ("hypeScore" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerSocialProfile_controversyScore_range" CHECK ("controversyScore" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerSocialProfile_marketabilityScore_range" CHECK ("marketabilityScore" BETWEEN 1 AND 100);
