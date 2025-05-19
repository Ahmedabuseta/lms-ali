import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { text, type, options, courseId, chapterId, difficulty } = await req.json();
    
    // Verify the course belongs to the teacher
    const courseOwnership = await db.course.findUnique({
      where: {
        id: courseId,
        //createdById: userId,
      },
    });
    
    if (!courseOwnership) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Create the practice question
    const question = await db.practiceQuestion.create({
      data: {
        text,
        type,
        difficulty: difficulty || null,
        courseId,
        chapterId: chapterId || null,
        options: {
          createMany: {
            data: options.map((option) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          },
        },
      },
      include: {
        options: true,
      },
    });
    
    return NextResponse.json(question);
  } catch (error) {
    console.error("[PRACTICE_QUESTION_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}