ALTER TABLE "Match"
ADD COLUMN "seasonId" TEXT,
ADD COLUMN "round" INTEGER,
ADD COLUMN "standingsUpdateRequired" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Match_seasonId_round_idx" ON "Match"("seasonId", "round");
