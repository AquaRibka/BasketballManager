CREATE TYPE "PlayerSocialPlatform" AS ENUM (
  'INSTAGRAM',
  'TIKTOK',
  'X',
  'YOUTUBE',
  'TELEGRAM',
  'VK'
);

CREATE TYPE "PlayerAudienceSentiment" AS ENUM (
  'NEGATIVE',
  'MIXED',
  'POSITIVE',
  'SUPPORTIVE'
);

CREATE TYPE "PlayerMediaStatus" AS ENUM (
  'LOW_PROFILE',
  'LOCAL_BUZZ',
  'NATIONAL_NAME',
  'LEAGUE_STAR',
  'ICON'
);

CREATE TABLE "PlayerSocialProfile" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "platform" "PlayerSocialPlatform" NOT NULL DEFAULT 'VK',
  "nickname" VARCHAR(80) NOT NULL,
  "followersCount" INTEGER NOT NULL DEFAULT 0,
  "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "audienceSentiment" "PlayerAudienceSentiment" NOT NULL DEFAULT 'MIXED',
  "mediaStatus" "PlayerMediaStatus" NOT NULL DEFAULT 'LOW_PROFILE',
  "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlayerSocialProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlayerSocialProfile_playerId_key" UNIQUE ("playerId"),
  CONSTRAINT "PlayerSocialProfile_followersCount_nonnegative" CHECK ("followersCount" >= 0),
  CONSTRAINT "PlayerSocialProfile_engagementRate_range" CHECK ("engagementRate" BETWEEN 0 AND 100)
);

CREATE INDEX "PlayerSocialProfile_platform_idx" ON "PlayerSocialProfile"("platform");
CREATE INDEX "PlayerSocialProfile_mediaStatus_idx" ON "PlayerSocialProfile"("mediaStatus");

ALTER TABLE "PlayerSocialProfile"
ADD CONSTRAINT "PlayerSocialProfile_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "PlayerSocialProfile" (
  "id",
  "playerId",
  "platform",
  "nickname",
  "followersCount",
  "engagementRate",
  "audienceSentiment",
  "mediaStatus",
  "lastUpdatedAt"
)
SELECT
  'psp_' || p."id",
  p."id",
  CASE
    WHEN p."overall" >= 85 THEN 'INSTAGRAM'::"PlayerSocialPlatform"
    WHEN p."overall" >= 78 THEN 'TELEGRAM'::"PlayerSocialPlatform"
    ELSE 'VK'::"PlayerSocialPlatform"
  END,
  '@' || COALESCE(
    NULLIF(LEFT(TRIM(BOTH '_' FROM regexp_replace(lower(p."name"), '[^a-z0-9]+', '_', 'g')), 24), ''),
    'player_profile'
  ),
  GREATEST(
    1200,
    ROUND((p."overall" * p."overall" * 38 + GREATEST(0, p."overall" - 70) * 4200))::INTEGER
  ),
  LEAST(100, ROUND((2.4 + GREATEST(0, p."overall" - 60) * 0.09)::numeric, 1))::DOUBLE PRECISION,
  CASE
    WHEN p."overall" >= 82 THEN 'SUPPORTIVE'::"PlayerAudienceSentiment"
    WHEN p."overall" >= 72 THEN 'POSITIVE'::"PlayerAudienceSentiment"
    ELSE 'MIXED'::"PlayerAudienceSentiment"
  END,
  CASE
    WHEN p."overall" >= 90 THEN 'ICON'::"PlayerMediaStatus"
    WHEN p."overall" >= 84 THEN 'LEAGUE_STAR'::"PlayerMediaStatus"
    WHEN p."overall" >= 76 THEN 'NATIONAL_NAME'::"PlayerMediaStatus"
    WHEN p."overall" >= 68 THEN 'LOCAL_BUZZ'::"PlayerMediaStatus"
    ELSE 'LOW_PROFILE'::"PlayerMediaStatus"
  END,
  CURRENT_TIMESTAMP
FROM "Player" p;
