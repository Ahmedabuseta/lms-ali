import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isTeacher } from '@/lib/teacher'

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth()
    const { title } = await req.json()

    if (!userId || !isTeacher(userId)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findUnique({
      where: { id: params.courseId, //createdById: userId },
    })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const lastChapter = await db.chapter.findFirst({
      where: { courseId: params.courseId },
      orderBy: { position: 'desc' },
    })

    const newPosition = lastChapter ? lastChapter.position + 1 : 1

    const newChapter = await db.chapter.create({
      data: { title, courseId: params.courseId, position: newPosition },
    })

    return NextResponse.json(newChapter)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth()
    const { searchParams } = new URL(req.url)
    const isPublished = searchParams.get('isPublished')

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify course ownership
    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        //createdById:userId
      }
    })

    // Build the query based on parameters
    const whereClause: any = {
      courseId: params.courseId,
    }

    if (isPublished === 'true') {
      whereClause.isPublished = true
    }

    // Get chapters
    const chapters = await db.chapter.findMany({
      where: whereClause,
      orderBy: {
        position: 'asc'
      }
    })

    return NextResponse.json(chapters)
  } catch (error) {
    console.error('[CHAPTERS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
