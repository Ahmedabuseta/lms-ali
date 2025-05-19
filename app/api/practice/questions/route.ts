import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getPracticeQuestions } from "@/actions/get-practice-questions";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const url = new URL(req.url);
    
    // Get query parameters
    const courseId = url.searchParams.get("courseId") || undefined;
    const chapterIdsParam = url.searchParams.get("chapterIds") || "";
    const chapterIds = chapterIdsParam ? chapterIdsParam.split(",") : undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    
    const questions = await getPracticeQuestions({
      userId,
      courseId,
      chapterIds,
      page,
      pageSize,
    });
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error("[PRACTICE_QUESTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}