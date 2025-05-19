import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { startExamAttempt } from "@/actions/exam-actions";

export async function POST(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const examAttempt = await startExamAttempt({
      userId,
      examId: params.examId,
    });

    return NextResponse.json(examAttempt);
  } catch (error) {
    console.error("[START_EXAM_ATTEMPT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}