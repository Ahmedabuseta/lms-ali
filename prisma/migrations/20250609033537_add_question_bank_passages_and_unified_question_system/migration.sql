/*
  Warnings:

  - You are about to drop the column `examId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `PracticeOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PracticeQuestion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `questionBankId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'PASSAGE';

-- DropForeignKey
ALTER TABLE "PracticeOption" DROP CONSTRAINT "PracticeOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeQuestion" DROP CONSTRAINT "PracticeQuestion_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeQuestion" DROP CONSTRAINT "PracticeQuestion_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_examId_fkey";

-- DropIndex
DROP INDEX "Question_examId_idx";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "examId",
ADD COLUMN     "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "passageId" TEXT,
ADD COLUMN     "questionBankId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PracticeOption";

-- DropTable
DROP TABLE "PracticeQuestion";

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "chapterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Passage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamQuestion_examId_idx" ON "ExamQuestion"("examId");

-- CreateIndex
CREATE INDEX "ExamQuestion_questionId_idx" ON "ExamQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamQuestion_examId_questionId_key" ON "ExamQuestion"("examId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamQuestion_examId_position_key" ON "ExamQuestion"("examId", "position");

-- CreateIndex
CREATE INDEX "QuestionBank_courseId_idx" ON "QuestionBank"("courseId");

-- CreateIndex
CREATE INDEX "QuestionBank_chapterId_idx" ON "QuestionBank"("chapterId");

-- CreateIndex
CREATE INDEX "PracticeAttempt_userId_idx" ON "PracticeAttempt"("userId");

-- CreateIndex
CREATE INDEX "PracticeAttempt_questionId_idx" ON "PracticeAttempt"("questionId");

-- CreateIndex
CREATE INDEX "PracticeAttempt_selectedOptionId_idx" ON "PracticeAttempt"("selectedOptionId");

-- CreateIndex
CREATE INDEX "Question_questionBankId_idx" ON "Question"("questionBankId");

-- CreateIndex
CREATE INDEX "Question_passageId_idx" ON "Question"("passageId");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "Passage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
