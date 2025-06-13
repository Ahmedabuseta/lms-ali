/*
  Warnings:

  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StripeCustomer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdById` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_courseId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "createdById" TEXT NOT NULL;

-- DropTable
DROP TABLE "Purchase";

-- DropTable
DROP TABLE "StripeCustomer";

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeLimit" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "requiredScore" INTEGER NOT NULL DEFAULT 100,
    "freeAttempts" INTEGER NOT NULL DEFAULT -1,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" INTEGER,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "isFreeAttempt" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestionAttempt" (
    "id" TEXT NOT NULL,
    "quizAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quiz_chapterId_idx" ON "Quiz"("chapterId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "QuizQuestion_questionId_idx" ON "QuizQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizId_questionId_key" ON "QuizQuestion"("quizId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizId_position_key" ON "QuizQuestion"("quizId", "position");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizQuestionAttempt_quizAttemptId_idx" ON "QuizQuestionAttempt"("quizAttemptId");

-- CreateIndex
CREATE INDEX "QuizQuestionAttempt_questionId_idx" ON "QuizQuestionAttempt"("questionId");

-- CreateIndex
CREATE INDEX "QuizQuestionAttempt_selectedOptionId_idx" ON "QuizQuestionAttempt"("selectedOptionId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionAttempt" ADD CONSTRAINT "QuizQuestionAttempt_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionAttempt" ADD CONSTRAINT "QuizQuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionAttempt" ADD CONSTRAINT "QuizQuestionAttempt_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
