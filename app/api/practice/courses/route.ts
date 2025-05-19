import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get courses that the user has access to and have practice questions
    const courses = await db.course.findMany({
      where: {
        OR: [
          {
            purchases: {
              some: {
                userId,
              },
            },
          },
          {
            //createdById: userId,
          },
        ],
        // Only include courses that have practice questions
        PracticeQuestion: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        chapters: {
          where: {
            isPublished: true,
            // Only include chapters that have practice questions
            PracticeQuestion: {
              some: {},
            },
          },
          select: {
            id: true,
            title: true,
            _count: {
              select: {
                PracticeQuestion: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            PracticeQuestion: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("[PRACTICE_COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}