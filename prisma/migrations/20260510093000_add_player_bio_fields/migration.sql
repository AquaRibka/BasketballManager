-- CreateEnum
CREATE TYPE "PlayerDominantHand" AS ENUM ('LEFT', 'RIGHT', 'AMBIDEXTROUS');

-- CreateEnum
CREATE TYPE "PlayerBodyType" AS ENUM ('SLIM', 'ATHLETIC', 'STRONG', 'HEAVY');

-- AlterTable
ALTER TABLE "Player"
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "dominantHand" "PlayerDominantHand",
ADD COLUMN "secondaryPositions" "PlayerPosition"[] NOT NULL DEFAULT ARRAY[]::"PlayerPosition"[];

-- AlterTable
ALTER TABLE "PlayerPhysicalProfile"
ADD COLUMN "bodyType" "PlayerBodyType";

-- Backfill player identity profile data
UPDATE "Player"
SET
  "dateOfBirth" = COALESCE(
    "dateOfBirth",
    make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INT - "age", 7, 1)::timestamp
  ),
  "dominantHand" = COALESCE("dominantHand", 'RIGHT'::"PlayerDominantHand")
WHERE "dateOfBirth" IS NULL
   OR "dominantHand" IS NULL;

-- Backfill missing physical profiles for players created after the previous profile migration
INSERT INTO "PlayerPhysicalProfile" (
  "id",
  "playerId",
  "heightCm",
  "weightKg",
  "wingspanCm",
  "bodyType",
  "standingReachCm",
  "speed",
  "acceleration",
  "strength",
  "agility",
  "vertical",
  "stamina",
  "endurance",
  "durability",
  "createdAt",
  "updatedAt"
)
SELECT
  'phys_' || "p"."id",
  "p"."id",
  CASE "p"."position"
    WHEN 'PG' THEN 185
    WHEN 'SG' THEN 191
    WHEN 'SF' THEN 198
    WHEN 'PF' THEN 205
    ELSE 211
  END,
  CASE "p"."position"
    WHEN 'PG' THEN 82
    WHEN 'SG' THEN 88
    WHEN 'SF' THEN 94
    WHEN 'PF' THEN 104
    ELSE 112
  END,
  CASE "p"."position"
    WHEN 'PG' THEN 192
    WHEN 'SG' THEN 199
    WHEN 'SF' THEN 206
    WHEN 'PF' THEN 214
    ELSE 221
  END,
  CASE "p"."position"
    WHEN 'PG' THEN 'SLIM'::"PlayerBodyType"
    WHEN 'SG' THEN 'ATHLETIC'::"PlayerBodyType"
    WHEN 'SF' THEN 'ATHLETIC'::"PlayerBodyType"
    WHEN 'PF' THEN 'STRONG'::"PlayerBodyType"
    ELSE 'HEAVY'::"PlayerBodyType"
  END,
  CASE "p"."position"
    WHEN 'PG' THEN 238
    WHEN 'SG' THEN 246
    WHEN 'SF' THEN 255
    WHEN 'PF' THEN 266
    ELSE 276
  END,
  GREATEST(1, LEAST(100, "p"."athleticism" + CASE "p"."position" WHEN 'PG' THEN 6 WHEN 'SG' THEN 4 WHEN 'SF' THEN 2 WHEN 'PF' THEN 0 ELSE -2 END)),
  GREATEST(1, LEAST(100, "p"."athleticism" + CASE "p"."position" WHEN 'PG' THEN 8 WHEN 'SG' THEN 5 WHEN 'SF' THEN 2 WHEN 'PF' THEN -1 ELSE -3 END)),
  GREATEST(1, LEAST(100, ROUND((("p"."defense" + "p"."rebounding") / 2.0) + CASE "p"."position" WHEN 'PG' THEN -2 WHEN 'SG' THEN 0 WHEN 'SF' THEN 2 WHEN 'PF' THEN 5 ELSE 7 END))),
  GREATEST(1, LEAST(100, "p"."athleticism" + CASE "p"."position" WHEN 'PG' THEN 7 WHEN 'SG' THEN 4 WHEN 'SF' THEN 2 WHEN 'PF' THEN -1 ELSE -3 END)),
  GREATEST(1, LEAST(100, "p"."athleticism" + CASE "p"."position" WHEN 'PG' THEN 5 WHEN 'SG' THEN 4 WHEN 'SF' THEN 2 WHEN 'PF' THEN 1 ELSE 0 END)),
  GREATEST(1, LEAST(100, "p"."athleticism" + CASE "p"."position" WHEN 'PG' THEN 3 WHEN 'SG' THEN 2 WHEN 'SF' THEN 1 WHEN 'PF' THEN 0 ELSE -1 END)),
  GREATEST(1, LEAST(100, "p"."athleticism" + CASE "p"."position" WHEN 'PG' THEN 2 WHEN 'SG' THEN 2 WHEN 'SF' THEN 1 WHEN 'PF' THEN 0 ELSE 0 END)),
  GREATEST(1, LEAST(100, 68 + GREATEST(0, "p"."age" - 24) + CASE "p"."position" WHEN 'PG' THEN -2 WHEN 'SG' THEN -1 WHEN 'SF' THEN 0 WHEN 'PF' THEN 2 ELSE 3 END)),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Player" "p"
LEFT JOIN "PlayerPhysicalProfile" "pp" ON "pp"."playerId" = "p"."id"
WHERE "pp"."playerId" IS NULL;

-- Backfill body type for existing physical profiles
UPDATE "PlayerPhysicalProfile" "pp"
SET "bodyType" = CASE "p"."position"
  WHEN 'PG' THEN 'SLIM'::"PlayerBodyType"
  WHEN 'SG' THEN 'ATHLETIC'::"PlayerBodyType"
  WHEN 'SF' THEN 'ATHLETIC'::"PlayerBodyType"
  WHEN 'PF' THEN 'STRONG'::"PlayerBodyType"
  ELSE 'HEAVY'::"PlayerBodyType"
END
FROM "Player" "p"
WHERE "p"."id" = "pp"."playerId"
  AND "pp"."bodyType" IS NULL;
