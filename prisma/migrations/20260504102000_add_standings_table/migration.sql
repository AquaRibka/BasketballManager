CREATE TABLE "Standing" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "wins" INTEGER NOT NULL DEFAULT 0,
  "losses" INTEGER NOT NULL DEFAULT 0,
  "pointsFor" INTEGER NOT NULL DEFAULT 0,
  "pointsAgainst" INTEGER NOT NULL DEFAULT 0,
  "pointDiff" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Standing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Standing_seasonId_teamId_key" ON "Standing"("seasonId", "teamId");
CREATE INDEX "Standing_seasonId_idx" ON "Standing"("seasonId");
CREATE INDEX "Standing_teamId_idx" ON "Standing"("teamId");

ALTER TABLE "Standing"
ADD CONSTRAINT "Standing_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
