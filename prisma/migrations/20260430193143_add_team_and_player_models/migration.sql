-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('PG', 'SG', 'SF', 'PF', 'C');

-- AlterTable
ALTER TABLE "Team"
ADD COLUMN "city" VARCHAR(120) NOT NULL,
ADD COLUMN "rating" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "shortName" VARCHAR(10) NOT NULL;

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "age" INTEGER NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "shooting" INTEGER NOT NULL,
    "passing" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "rebounding" INTEGER NOT NULL,
    "athleticism" INTEGER NOT NULL,
    "potential" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_shortName_key" ON "Team"("shortName");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- AddForeignKey
ALTER TABLE "Player"
ADD CONSTRAINT "Player_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Team constraints
ALTER TABLE "Team"
ADD CONSTRAINT "Team_name_not_blank" CHECK (btrim("name") <> ''),
ADD CONSTRAINT "Team_city_not_blank" CHECK (btrim("city") <> ''),
ADD CONSTRAINT "Team_shortName_not_blank" CHECK (btrim("shortName") <> ''),
ADD CONSTRAINT "Team_rating_range" CHECK ("rating" BETWEEN 0 AND 100);

-- Player constraints
ALTER TABLE "Player"
ADD CONSTRAINT "Player_name_not_blank" CHECK (btrim("name") <> ''),
ADD CONSTRAINT "Player_age_range" CHECK ("age" BETWEEN 16 AND 50),
ADD CONSTRAINT "Player_shooting_range" CHECK ("shooting" BETWEEN 0 AND 100),
ADD CONSTRAINT "Player_passing_range" CHECK ("passing" BETWEEN 0 AND 100),
ADD CONSTRAINT "Player_defense_range" CHECK ("defense" BETWEEN 0 AND 100),
ADD CONSTRAINT "Player_rebounding_range" CHECK ("rebounding" BETWEEN 0 AND 100),
ADD CONSTRAINT "Player_athleticism_range" CHECK ("athleticism" BETWEEN 0 AND 100),
ADD CONSTRAINT "Player_potential_range" CHECK ("potential" BETWEEN 0 AND 100),
ADD CONSTRAINT "Player_overall_range" CHECK ("overall" BETWEEN 0 AND 100),
ADD CONSTRAINT "Player_overall_lte_potential" CHECK ("overall" <= "potential");
