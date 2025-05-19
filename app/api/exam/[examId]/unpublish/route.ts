import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the exam with its course to check ownership
    const examWithCourse = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
      },
    });

    if (!examWithCourse) {
      return new NextResponse("Exam not found", { status: 404 });
    }

    // Verify ownership through course
    if (examWithCourse.course.//createdById !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the exam has any active attempts
    const activeAttempts = await db.examAttempt.count({
      where: {
        examId: params.examId,
        status: "IN_PROGRESS",
      },
    });

    if (activeAttempts > 0) {
      return new NextResponse(
        "Cannot unpublish an exam with active attempts",
        { status: 400 }
      );
    }

    // Unpublish the exam
    const unpublishedExam = await db.exam.update({
      where: {
        id: params.examId,
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(unpublishedExam);
  } catch (error) {
    console.error("[EXAM_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}