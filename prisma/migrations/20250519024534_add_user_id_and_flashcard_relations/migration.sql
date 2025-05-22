/*
  Warnings:

  - You are about to drop the column `//createdById` on the `Course` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "//createdById",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_CourseToFlashcard" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToFlashcard_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToFlashcard_B_index" ON "_CourseToFlashcard"("B");

-- AddForeignKey
ALTER TABLE "_CourseToFlashcard" ADD CONSTRAINT "_CourseToFlashcard_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToFlashcard" ADD CONSTRAINT "_CourseToFlashcard_B_fkey" FOREIGN KEY ("B") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
