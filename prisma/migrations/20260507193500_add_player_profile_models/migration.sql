-- CreateTable
CREATE TABLE "PlayerTechnicalAttributes" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "shooting" INTEGER NOT NULL,
    "passing" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "rebounding" INTEGER NOT NULL,
    "ballHandling" INTEGER NOT NULL,
    "dribbling" INTEGER NOT NULL,
    "midRangeShot" INTEGER NOT NULL,
    "threePointShot" INTEGER NOT NULL,
    "freeThrow" INTEGER NOT NULL,
    "rimFinishing" INTEGER NOT NULL,
    "dunking" INTEGER NOT NULL,
    "postMoves" INTEGER NOT NULL,
    "perimeterDefense" INTEGER NOT NULL,
    "interiorDefense" INTEGER NOT NULL,
    "offensiveRebound" INTEGER NOT NULL,
    "defensiveRebound" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerTechnicalAttributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPhysicalProfile" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "weightKg" INTEGER NOT NULL,
    "wingspanCm" INTEGER,
    "standingReachCm" INTEGER,
    "speed" INTEGER NOT NULL,
    "acceleration" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "agility" INTEGER NOT NULL,
    "vertical" INTEGER NOT NULL,
    "stamina" INTEGER NOT NULL,
    "endurance" INTEGER NOT NULL,
    "durability" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerPhysicalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMentalAttributes" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "composure" INTEGER NOT NULL,
    "workEthic" INTEGER NOT NULL,
    "professionalism" INTEGER NOT NULL,
    "leadership" INTEGER NOT NULL,
    "competitiveness" INTEGER NOT NULL,
    "teamOrientation" INTEGER NOT NULL,
    "loyalty" INTEGER NOT NULL,
    "ego" INTEGER NOT NULL,
    "clutchFactor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerMentalAttributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTacticalAttributes" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "basketballIQ" INTEGER NOT NULL,
    "decisionMaking" INTEGER NOT NULL,
    "shotSelection" INTEGER NOT NULL,
    "helpDefenseAwareness" INTEGER NOT NULL,
    "offBallAwareness" INTEGER NOT NULL,
    "pickAndRollRead" INTEGER NOT NULL,
    "spacingSense" INTEGER NOT NULL,
    "playDiscipline" INTEGER NOT NULL,
    "foulDiscipline" INTEGER NOT NULL,
    "transitionInstincts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerTacticalAttributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerHiddenAttributes" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "consistency" INTEGER NOT NULL,
    "injuryProneness" INTEGER NOT NULL,
    "declineResistance" INTEGER NOT NULL,
    "adaptability" INTEGER NOT NULL,
    "discipline" INTEGER NOT NULL,
    "ambition" INTEGER NOT NULL,
    "resilience" INTEGER NOT NULL,
    "pressureHandling" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerHiddenAttributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerHealthProfile" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "durability" INTEGER NOT NULL,
    "recoveryRate" INTEGER NOT NULL,
    "injuryRisk" INTEGER NOT NULL,
    "fatigueBase" INTEGER NOT NULL,
    "matchFitness" INTEGER NOT NULL,
    "painTolerance" INTEGER NOT NULL,
    "medicalOutlook" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerHealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPotentialProfile" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "potential" INTEGER NOT NULL,
    "growthRate" INTEGER NOT NULL,
    "learningAbility" INTEGER NOT NULL,
    "peakWindowStart" INTEGER NOT NULL,
    "peakWindowEnd" INTEGER NOT NULL,
    "ceilingTier" INTEGER NOT NULL,
    "readiness" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerPotentialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerReputationProfile" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "reputation" INTEGER NOT NULL,
    "leagueReputation" INTEGER NOT NULL,
    "internationalReputation" INTEGER NOT NULL,
    "starPower" INTEGER NOT NULL,
    "fanAppeal" INTEGER NOT NULL,
    "mediaHandling" INTEGER NOT NULL,
    "agentInfluence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerReputationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTechnicalAttributes_playerId_key" ON "PlayerTechnicalAttributes"("playerId");
CREATE UNIQUE INDEX "PlayerPhysicalProfile_playerId_key" ON "PlayerPhysicalProfile"("playerId");
CREATE UNIQUE INDEX "PlayerMentalAttributes_playerId_key" ON "PlayerMentalAttributes"("playerId");
CREATE UNIQUE INDEX "PlayerTacticalAttributes_playerId_key" ON "PlayerTacticalAttributes"("playerId");
CREATE UNIQUE INDEX "PlayerHiddenAttributes_playerId_key" ON "PlayerHiddenAttributes"("playerId");
CREATE UNIQUE INDEX "PlayerHealthProfile_playerId_key" ON "PlayerHealthProfile"("playerId");
CREATE UNIQUE INDEX "PlayerPotentialProfile_playerId_key" ON "PlayerPotentialProfile"("playerId");
CREATE UNIQUE INDEX "PlayerReputationProfile_playerId_key" ON "PlayerReputationProfile"("playerId");

-- AddForeignKey
ALTER TABLE "PlayerTechnicalAttributes"
ADD CONSTRAINT "PlayerTechnicalAttributes_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PlayerPhysicalProfile"
ADD CONSTRAINT "PlayerPhysicalProfile_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PlayerMentalAttributes"
ADD CONSTRAINT "PlayerMentalAttributes_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PlayerTacticalAttributes"
ADD CONSTRAINT "PlayerTacticalAttributes_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PlayerHiddenAttributes"
ADD CONSTRAINT "PlayerHiddenAttributes_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PlayerHealthProfile"
ADD CONSTRAINT "PlayerHealthProfile_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PlayerPotentialProfile"
ADD CONSTRAINT "PlayerPotentialProfile_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PlayerReputationProfile"
ADD CONSTRAINT "PlayerReputationProfile_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- PlayerTechnicalAttributes constraints
ALTER TABLE "PlayerTechnicalAttributes"
ADD CONSTRAINT "PlayerTechnicalAttributes_shooting_range" CHECK ("shooting" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_passing_range" CHECK ("passing" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_defense_range" CHECK ("defense" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_rebounding_range" CHECK ("rebounding" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_ballHandling_range" CHECK ("ballHandling" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_dribbling_range" CHECK ("dribbling" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_midRangeShot_range" CHECK ("midRangeShot" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_threePointShot_range" CHECK ("threePointShot" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_freeThrow_range" CHECK ("freeThrow" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_rimFinishing_range" CHECK ("rimFinishing" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_dunking_range" CHECK ("dunking" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_postMoves_range" CHECK ("postMoves" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_perimeterDefense_range" CHECK ("perimeterDefense" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_interiorDefense_range" CHECK ("interiorDefense" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_offensiveRebound_range" CHECK ("offensiveRebound" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTechnicalAttributes_defensiveRebound_range" CHECK ("defensiveRebound" BETWEEN 1 AND 100);

-- PlayerPhysicalProfile constraints
ALTER TABLE "PlayerPhysicalProfile"
ADD CONSTRAINT "PlayerPhysicalProfile_heightCm_range" CHECK ("heightCm" BETWEEN 165 AND 230),
ADD CONSTRAINT "PlayerPhysicalProfile_weightKg_range" CHECK ("weightKg" BETWEEN 65 AND 160),
ADD CONSTRAINT "PlayerPhysicalProfile_wingspanCm_range" CHECK ("wingspanCm" IS NULL OR "wingspanCm" BETWEEN 170 AND 245),
ADD CONSTRAINT "PlayerPhysicalProfile_standingReachCm_range" CHECK ("standingReachCm" IS NULL OR "standingReachCm" BETWEEN 210 AND 310),
ADD CONSTRAINT "PlayerPhysicalProfile_speed_range" CHECK ("speed" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_acceleration_range" CHECK ("acceleration" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_strength_range" CHECK ("strength" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_agility_range" CHECK ("agility" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_vertical_range" CHECK ("vertical" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_stamina_range" CHECK ("stamina" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_endurance_range" CHECK ("endurance" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPhysicalProfile_durability_range" CHECK ("durability" BETWEEN 1 AND 100);

-- PlayerMentalAttributes constraints
ALTER TABLE "PlayerMentalAttributes"
ADD CONSTRAINT "PlayerMentalAttributes_confidence_range" CHECK ("confidence" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_composure_range" CHECK ("composure" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_workEthic_range" CHECK ("workEthic" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_professionalism_range" CHECK ("professionalism" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_leadership_range" CHECK ("leadership" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_competitiveness_range" CHECK ("competitiveness" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_teamOrientation_range" CHECK ("teamOrientation" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_loyalty_range" CHECK ("loyalty" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_ego_range" CHECK ("ego" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerMentalAttributes_clutchFactor_range" CHECK ("clutchFactor" BETWEEN 1 AND 100);

-- PlayerTacticalAttributes constraints
ALTER TABLE "PlayerTacticalAttributes"
ADD CONSTRAINT "PlayerTacticalAttributes_basketballIQ_range" CHECK ("basketballIQ" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_decisionMaking_range" CHECK ("decisionMaking" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_shotSelection_range" CHECK ("shotSelection" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_helpDefenseAwareness_range" CHECK ("helpDefenseAwareness" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_offBallAwareness_range" CHECK ("offBallAwareness" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_pickAndRollRead_range" CHECK ("pickAndRollRead" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_spacingSense_range" CHECK ("spacingSense" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_playDiscipline_range" CHECK ("playDiscipline" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_foulDiscipline_range" CHECK ("foulDiscipline" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerTacticalAttributes_transitionInstincts_range" CHECK ("transitionInstincts" BETWEEN 1 AND 100);

-- PlayerHiddenAttributes constraints
ALTER TABLE "PlayerHiddenAttributes"
ADD CONSTRAINT "PlayerHiddenAttributes_consistency_range" CHECK ("consistency" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_injuryProneness_range" CHECK ("injuryProneness" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_declineResistance_range" CHECK ("declineResistance" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_adaptability_range" CHECK ("adaptability" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_discipline_range" CHECK ("discipline" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_ambition_range" CHECK ("ambition" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_resilience_range" CHECK ("resilience" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHiddenAttributes_pressureHandling_range" CHECK ("pressureHandling" BETWEEN 1 AND 100);

-- PlayerHealthProfile constraints
ALTER TABLE "PlayerHealthProfile"
ADD CONSTRAINT "PlayerHealthProfile_durability_range" CHECK ("durability" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHealthProfile_recoveryRate_range" CHECK ("recoveryRate" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHealthProfile_injuryRisk_range" CHECK ("injuryRisk" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHealthProfile_fatigueBase_range" CHECK ("fatigueBase" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHealthProfile_matchFitness_range" CHECK ("matchFitness" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHealthProfile_painTolerance_range" CHECK ("painTolerance" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerHealthProfile_medicalOutlook_range" CHECK ("medicalOutlook" BETWEEN 1 AND 100);

-- PlayerPotentialProfile constraints
ALTER TABLE "PlayerPotentialProfile"
ADD CONSTRAINT "PlayerPotentialProfile_potential_range" CHECK ("potential" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPotentialProfile_growthRate_range" CHECK ("growthRate" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPotentialProfile_learningAbility_range" CHECK ("learningAbility" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPotentialProfile_peakWindowStart_range" CHECK ("peakWindowStart" BETWEEN 16 AND 40),
ADD CONSTRAINT "PlayerPotentialProfile_peakWindowEnd_range" CHECK ("peakWindowEnd" BETWEEN 16 AND 40),
ADD CONSTRAINT "PlayerPotentialProfile_peakWindow_order" CHECK ("peakWindowStart" <= "peakWindowEnd"),
ADD CONSTRAINT "PlayerPotentialProfile_ceilingTier_range" CHECK ("ceilingTier" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerPotentialProfile_readiness_range" CHECK ("readiness" BETWEEN 1 AND 100);

-- PlayerReputationProfile constraints
ALTER TABLE "PlayerReputationProfile"
ADD CONSTRAINT "PlayerReputationProfile_reputation_range" CHECK ("reputation" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerReputationProfile_leagueReputation_range" CHECK ("leagueReputation" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerReputationProfile_internationalReputation_range" CHECK ("internationalReputation" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerReputationProfile_starPower_range" CHECK ("starPower" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerReputationProfile_fanAppeal_range" CHECK ("fanAppeal" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerReputationProfile_mediaHandling_range" CHECK ("mediaHandling" BETWEEN 1 AND 100),
ADD CONSTRAINT "PlayerReputationProfile_agentInfluence_range" CHECK ("agentInfluence" BETWEEN 1 AND 100);

-- Backfill profile rows for existing players
INSERT INTO "PlayerTechnicalAttributes" (
    "id",
    "playerId",
    "shooting",
    "passing",
    "defense",
    "rebounding",
    "ballHandling",
    "dribbling",
    "midRangeShot",
    "threePointShot",
    "freeThrow",
    "rimFinishing",
    "dunking",
    "postMoves",
    "perimeterDefense",
    "interiorDefense",
    "offensiveRebound",
    "defensiveRebound",
    "updatedAt"
)
SELECT
    "id" || '_tech',
    "id",
    GREATEST(1, LEAST(100, "shooting")),
    GREATEST(1, LEAST(100, "passing")),
    GREATEST(1, LEAST(100, "defense")),
    GREATEST(1, LEAST(100, "rebounding")),
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.55 + "shooting" * 0.45))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.5 + "athleticism" * 0.3 + "shooting" * 0.2))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("shooting" * 0.75 + "passing" * 0.25))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("shooting" * 0.9 + "passing" * 0.1))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("shooting" * 0.7 + "mental"."baseComposure" * 0.3))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.45 + "shooting" * 0.3 + "passing" * 0.25))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.7 + "shooting" * 0.15 + "rebounding" * 0.15))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("rebounding" * 0.45 + "defense" * 0.35 + "athleticism" * 0.2))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.8 + "athleticism" * 0.2))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.8 + "rebounding" * 0.2))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("rebounding" * 0.9 + "athleticism" * 0.1))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("rebounding" * 0.75 + "defense" * 0.25))::INTEGER)),
    CURRENT_TIMESTAMP
FROM "Player"
CROSS JOIN LATERAL (
    SELECT GREATEST(1, LEAST(100, ROUND(("age" * 0.4 + 50))::INTEGER)) AS "baseComposure"
) AS "mental"
ON CONFLICT ("playerId") DO NOTHING;

INSERT INTO "PlayerPhysicalProfile" (
    "id",
    "playerId",
    "heightCm",
    "weightKg",
    "wingspanCm",
    "standingReachCm",
    "speed",
    "acceleration",
    "strength",
    "agility",
    "vertical",
    "stamina",
    "endurance",
    "durability",
    "updatedAt"
)
SELECT
    "id" || '_phys',
    "id",
    CASE "position"
        WHEN 'PG' THEN 188
        WHEN 'SG' THEN 194
        WHEN 'SF' THEN 201
        WHEN 'PF' THEN 206
        ELSE 210
    END,
    CASE "position"
        WHEN 'PG' THEN 84
        WHEN 'SG' THEN 89
        WHEN 'SF' THEN 96
        WHEN 'PF' THEN 105
        ELSE 112
    END,
    CASE "position"
        WHEN 'PG' THEN 194
        WHEN 'SG' THEN 201
        WHEN 'SF' THEN 208
        WHEN 'PF' THEN 213
        ELSE 220
    END,
    CASE "position"
        WHEN 'PG' THEN 244
        WHEN 'SG' THEN 253
        WHEN 'SF' THEN 263
        WHEN 'PF' THEN 270
        ELSE 279
    END,
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.78 + (100 - "rebounding") * 0.08 + (100 - "age") * 0.14))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.84 + (100 - "age") * 0.16))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.55 + "rebounding" * 0.25 + "defense" * 0.2))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.76 + "passing" * 0.12 + (100 - "age") * 0.12))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.82 + "rebounding" * 0.18))::INTEGER)),
    GREATEST(1, LEAST(100, "athleticism")),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.72 + (100 - "age") * 0.28))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.68 + "defense" * 0.18 + (100 - "age") * 0.14))::INTEGER)),
    CURRENT_TIMESTAMP
FROM "Player"
ON CONFLICT ("playerId") DO NOTHING;

INSERT INTO "PlayerMentalAttributes" (
    "id",
    "playerId",
    "confidence",
    "composure",
    "workEthic",
    "professionalism",
    "leadership",
    "competitiveness",
    "teamOrientation",
    "loyalty",
    "ego",
    "clutchFactor",
    "updatedAt"
)
SELECT
    "id" || '_mental',
    "id",
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.65 + "potential" * 0.15 + 12))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("age" * 1.6 + "overall" * 0.32 + 8))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("potential" * 0.55 + (100 - "age") * 0.2 + 20))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("age" * 1.5 + 22))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("age" * 1.1 + "overall" * 0.25 + 10))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.35 + "rebounding" * 0.2 + "overall" * 0.25 + 15))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.3 + "defense" * 0.2 + 25))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("age" * 1.3 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.28 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("confidence" * 0.45 + "shooting" * 0.25 + "composure" * 0.3))::INTEGER)),
    CURRENT_TIMESTAMP
FROM (
    SELECT
        "Player".*,
        GREATEST(1, LEAST(100, ROUND(("Player"."overall" * 0.65 + "Player"."potential" * 0.15 + 12))::INTEGER)) AS "confidence",
        GREATEST(1, LEAST(100, ROUND(("Player"."age" * 1.6 + "Player"."overall" * 0.32 + 8))::INTEGER)) AS "composure"
    FROM "Player"
) AS "Player"
ON CONFLICT ("playerId") DO NOTHING;

INSERT INTO "PlayerTacticalAttributes" (
    "id",
    "playerId",
    "basketballIQ",
    "decisionMaking",
    "shotSelection",
    "helpDefenseAwareness",
    "offBallAwareness",
    "pickAndRollRead",
    "spacingSense",
    "playDiscipline",
    "foulDiscipline",
    "transitionInstincts",
    "updatedAt"
)
SELECT
    "id" || '_tact',
    "id",
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.28 + "defense" * 0.24 + "overall" * 0.22 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.4 + "shooting" * 0.15 + "overall" * 0.2 + 15))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("shooting" * 0.45 + "overall" * 0.2 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.55 + "passing" * 0.15 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.2 + "shooting" * 0.2 + "athleticism" * 0.2 + 20))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.5 + "overall" * 0.15 + 12))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("shooting" * 0.25 + "passing" * 0.15 + 28))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.22 + "passing" * 0.15 + 26))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.4 + (100 - "athleticism") * 0.1 + 26))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.45 + "passing" * 0.15 + 18))::INTEGER)),
    CURRENT_TIMESTAMP
FROM "Player"
ON CONFLICT ("playerId") DO NOTHING;

INSERT INTO "PlayerHiddenAttributes" (
    "id",
    "playerId",
    "consistency",
    "injuryProneness",
    "declineResistance",
    "adaptability",
    "discipline",
    "ambition",
    "resilience",
    "pressureHandling",
    "updatedAt"
)
SELECT
    "id" || '_hidden',
    "id",
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.35 + "age" * 0.7 + 15))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(((100 - "athleticism") * 0.45 + "age" * 0.9))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(((100 - "age") * 0.35 + "athleticism" * 0.3 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("passing" * 0.18 + "overall" * 0.18 + 24))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.18 + "passing" * 0.12 + 28))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("potential" * 0.5 + (100 - "age") * 0.15 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("defense" * 0.22 + "overall" * 0.2 + 18))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.28 + "potential" * 0.18 + 18))::INTEGER)),
    CURRENT_TIMESTAMP
FROM "Player"
ON CONFLICT ("playerId") DO NOTHING;

INSERT INTO "PlayerHealthProfile" (
    "id",
    "playerId",
    "durability",
    "recoveryRate",
    "injuryRisk",
    "fatigueBase",
    "matchFitness",
    "painTolerance",
    "medicalOutlook",
    "updatedAt"
)
SELECT
    "id" || '_health',
    "id",
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.55 + "defense" * 0.15 + (100 - "age") * 0.3))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.42 + (100 - "age") * 0.38 + 12))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(((100 - "athleticism") * 0.4 + "age" * 0.95))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(((100 - "athleticism") * 0.28 + 24))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.72 + 12))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.25 + "age" * 0.9 + 10))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("athleticism" * 0.35 + (100 - "age") * 0.25 + 25))::INTEGER)),
    CURRENT_TIMESTAMP
FROM "Player"
ON CONFLICT ("playerId") DO NOTHING;

INSERT INTO "PlayerPotentialProfile" (
    "id",
    "playerId",
    "potential",
    "growthRate",
    "learningAbility",
    "peakWindowStart",
    "peakWindowEnd",
    "ceilingTier",
    "readiness",
    "updatedAt"
)
SELECT
    "id" || '_pot',
    "id",
    GREATEST(1, LEAST(100, "potential")),
    GREATEST(1, LEAST(100, ROUND((("potential" - "overall") * 2.5 + 35))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND((("passing" + "athleticism") * 0.3 + 20))::INTEGER)),
    GREATEST(16, LEAST(40, CASE WHEN "age" <= 21 THEN 22 WHEN "age" <= 26 THEN 24 ELSE 26 END)),
    GREATEST(16, LEAST(40, CASE WHEN "age" <= 21 THEN 29 WHEN "age" <= 26 THEN 30 ELSE 31 END)),
    GREATEST(1, LEAST(100, "potential")),
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.75 + (100 - ("potential" - "overall")) * 0.1))::INTEGER)),
    CURRENT_TIMESTAMP
FROM "Player"
ON CONFLICT ("playerId") DO NOTHING;

INSERT INTO "PlayerReputationProfile" (
    "id",
    "playerId",
    "reputation",
    "leagueReputation",
    "internationalReputation",
    "starPower",
    "fanAppeal",
    "mediaHandling",
    "agentInfluence",
    "updatedAt"
)
SELECT
    "id" || '_rep',
    "id",
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.45 + "age" * 0.7 + 10))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.5 + 12))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("overall" * 0.35 + "potential" * 0.2 + 8))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("shooting" * 0.22 + "overall" * 0.35 + 12))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("reputation" * 0.55 + "starPower" * 0.25))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("age" * 1.1 + 20))::INTEGER)),
    GREATEST(1, LEAST(100, ROUND(("reputation" * 0.4 + "potential" * 0.2 + 10))::INTEGER)),
    CURRENT_TIMESTAMP
FROM (
    SELECT
        "Player".*,
        GREATEST(1, LEAST(100, ROUND(("Player"."overall" * 0.45 + "Player"."age" * 0.7 + 10))::INTEGER)) AS "reputation",
        GREATEST(1, LEAST(100, ROUND(("Player"."shooting" * 0.22 + "Player"."overall" * 0.35 + 12))::INTEGER)) AS "starPower"
    FROM "Player"
) AS "Player"
ON CONFLICT ("playerId") DO NOTHING;
