ALTER TABLE "Match"
ADD COLUMN "date" TIMESTAMP(3);

CREATE INDEX "Match_date_idx" ON "Match"("date");
