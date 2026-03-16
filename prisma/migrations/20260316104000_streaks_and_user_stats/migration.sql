-- CreateTable
CREATE TABLE "DailyStudyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStudyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalReviewedCards" INTEGER NOT NULL DEFAULT 0,
    "totalStudySessions" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyStudyActivity_userId_activityDate_key" ON "DailyStudyActivity"("userId", "activityDate");
CREATE INDEX "DailyStudyActivity_userId_activityDate_idx" ON "DailyStudyActivity"("userId", "activityDate");

-- AddForeignKey
ALTER TABLE "DailyStudyActivity"
ADD CONSTRAINT "DailyStudyActivity_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserStats"
ADD CONSTRAINT "UserStats_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
