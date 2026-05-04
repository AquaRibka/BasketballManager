ALTER TABLE "Standing"
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Standing_seasonId_position_idx" ON "Standing"("seasonId", "position");
