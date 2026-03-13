-- AlterTable
ALTER TABLE "User"
ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';

ALTER TABLE "User"
ALTER COLUMN "passwordHash" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Card"
RENAME COLUMN "front" TO "word";

ALTER TABLE "Card"
RENAME COLUMN "back" TO "translation";

ALTER TABLE "Card"
ADD COLUMN "example" TEXT,
ADD COLUMN "imageUrl" TEXT;
