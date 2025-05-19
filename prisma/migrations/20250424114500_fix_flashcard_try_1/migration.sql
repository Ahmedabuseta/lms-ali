/*
  Warnings:

  - You are about to drop the column `courseId` on the `Flashcard` table. All the data in the column will be lost.
  - Made the column `chapterId` on table `Flashcard` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_courseId_fkey";

-- DropIndex
DROP INDEX "Flashcard_courseId_idx";

-- AlterTable
ALTER TABLE "Flashcard" DROP COLUMN "courseId",
ALTER COLUMN "chapterId" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
