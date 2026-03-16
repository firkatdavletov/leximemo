-- CreateEnum
CREATE TYPE "ReviewGrade" AS ENUM ('HARD', 'NORMAL', 'EASY');

-- AlterTable
ALTER TABLE "Card"
ADD COLUMN "repetitionsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "intervalDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN "nextReviewAt" TIMESTAMP(3),
ADD COLUMN "lastGrade" "ReviewGrade",
ADD COLUMN "mistakesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReviewHistory"
ADD COLUMN "userId" TEXT,
ADD COLUMN "deckId" TEXT,
ADD COLUMN "grade" "ReviewGrade" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "previousIntervalDays" INTEGER,
ADD COLUMN "newIntervalDays" INTEGER;

-- Backfill existing rows if any.
UPDATE "ReviewHistory" AS rh
SET
  "deckId" = c."deckId",
  "userId" = d."userId",
  "newIntervalDays" = COALESCE(rh."intervalDays", 1),
  "grade" = CASE
    WHEN rh."rating" <= 1 THEN 'HARD'::"ReviewGrade"
    WHEN rh."rating" = 2 THEN 'NORMAL'::"ReviewGrade"
    ELSE 'EASY'::"ReviewGrade"
  END
FROM "Card" AS c
JOIN "Deck" AS d ON d."id" = c."deckId"
WHERE rh."cardId" = c."id";

ALTER TABLE "ReviewHistory"
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "deckId" SET NOT NULL,
ALTER COLUMN "newIntervalDays" SET NOT NULL,
ALTER COLUMN "grade" DROP DEFAULT;

ALTER TABLE "ReviewHistory"
DROP COLUMN "rating",
DROP COLUMN "intervalDays";

-- CreateIndex
CREATE INDEX "Card_nextReviewAt_idx" ON "Card"("nextReviewAt");
CREATE INDEX "Card_deckId_nextReviewAt_idx" ON "Card"("deckId", "nextReviewAt");
CREATE INDEX "ReviewHistory_userId_reviewedAt_idx" ON "ReviewHistory"("userId", "reviewedAt");
CREATE INDEX "ReviewHistory_deckId_reviewedAt_idx" ON "ReviewHistory"("deckId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "ReviewHistory"
ADD CONSTRAINT "ReviewHistory_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewHistory"
ADD CONSTRAINT "ReviewHistory_deckId_fkey"
FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
