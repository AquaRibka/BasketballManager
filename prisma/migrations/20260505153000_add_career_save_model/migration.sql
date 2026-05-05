CREATE TABLE "CareerSave" (
  "id" TEXT NOT NULL,
  "saveName" VARCHAR(120) NOT NULL,
  "selectedTeamId" TEXT NOT NULL,
  "currentSeasonId" TEXT NOT NULL,
  "currentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "currentRound" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CareerSave_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CareerSave_selectedTeamId_idx" ON "CareerSave"("selectedTeamId");
CREATE INDEX "CareerSave_currentSeasonId_idx" ON "CareerSave"("currentSeasonId");
CREATE INDEX "CareerSave_updatedAt_idx" ON "CareerSave"("updatedAt");

ALTER TABLE "CareerSave"
ADD CONSTRAINT "CareerSave_selectedTeamId_fkey"
FOREIGN KEY ("selectedTeamId") REFERENCES "Team"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CareerSave"
ADD CONSTRAINT "CareerSave_currentSeasonId_fkey"
FOREIGN KEY ("currentSeasonId") REFERENCES "Season"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CareerSave"
ADD CONSTRAINT "CareerSave_saveName_not_empty" CHECK (length(trim("saveName")) > 0),
ADD CONSTRAINT "CareerSave_currentRound_positive" CHECK ("currentRound" >= 1);
