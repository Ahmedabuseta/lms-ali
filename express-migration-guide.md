# Express.js Migration Guide with Bun

## Overview
This guide converts all Next.js API routes to Express.js with Bun runtime.

## Project Setup

### Dependencies
```bash
bun add express cors helmet compression morgan
bun add @types/express @types/cors @types/morgan -d
```

### Basic Structure
```
express-api/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── lib/
├── package.json
└── .env
```

## Route Mapping

### Current Next.js Routes → Express Routes

#### Course Management
- `app/api/courses/route.ts` → `/api/courses`
- `app/api/courses/[courseId]/route.ts` → `/api/courses/:courseId`
- `app/api/courses/[courseId]/chapters/route.ts` → `/api/courses/:courseId/chapters`
- `app/api/courses/[courseId]/chapters/[chapterId]/route.ts` → `/api/courses/:courseId/chapters/:chapterId`

#### Exam System
- `app/api/exam/route.ts` → `/api/exam`
- `app/api/exam/[examId]/route.ts` → `/api/exam/:examId`
- `app/api/exam/[examId]/questions/route.ts` → `/api/exam/:examId/questions`

#### Other Routes
- `app/api/flashcards/route.ts` → `/api/flashcards`
- `app/api/practice/courses/route.ts` → `/api/practice/courses`
- `app/api/user/permissions/route.ts` → `/api/user/permissions`
- `app/api/upload/route.ts` → `/api/upload`

## Basic Express Setup

### src/server.ts
```typescript
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### src/routes/index.ts
```typescript
import { Router } from 'express';
import courseRoutes from './courses';
import examRoutes from './exams';
import userRoutes from './users';

const router = Router();

router.use('/courses', courseRoutes);
router.use('/exam', examRoutes);
router.use('/user', userRoutes);

export default router;
```

## Conversion Examples

### Before (Next.js)
```typescript
// app/api/courses/route.ts
export async function GET(req: Request) {
  const { userId } = getAuth();
  const courses = await db.course.findMany();
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const { userId } = getAuth();
  const body = await req.json();
  const course = await db.course.create({ data: body });
  return NextResponse.json(course);
}
```

### After (Express)
```typescript
// src/routes/courses.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const courses = await db.course.findMany();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const course = await db.course.create({ data: req.body });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

## Authentication Middleware

### src/middleware/auth.ts
```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const user = await getAuthenticatedUser(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

## Complete Route Examples

### Course Routes
```typescript
// src/routes/courses.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Basic CRUD
router.get('/', getCourses);
router.post('/', authMiddleware, createCourse);
router.get('/:courseId', getCourse);
router.patch('/:courseId', authMiddleware, updateCourse);
router.delete('/:courseId', authMiddleware, deleteCourse);

// Course actions
router.patch('/:courseId/publish', authMiddleware, publishCourse);
router.patch('/:courseId/unpublish', authMiddleware, unpublishCourse);

// Chapters
router.get('/:courseId/chapters', getChapters);
router.post('/:courseId/chapters', authMiddleware, createChapter);
router.patch('/:courseId/chapters/:chapterId', authMiddleware, updateChapter);
router.delete('/:courseId/chapters/:chapterId', authMiddleware, deleteChapter);

export default router;
```

### Exam Routes
```typescript
// src/routes/exams.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Exam management
router.get('/', getExams);
router.post('/', authMiddleware, createExam);
router.get('/:examId', getExam);
router.patch('/:examId', authMiddleware, updateExam);
router.delete('/:examId', authMiddleware, deleteExam);

// Questions
router.get('/:examId/questions', getQuestions);
router.post('/:examId/questions', authMiddleware, createQuestion);
router.patch('/:examId/questions/:questionId', authMiddleware, updateQuestion);

// Attempts
router.post('/:examId/attempt', authMiddleware, createAttempt);
router.post('/:examId/attempt/:attemptId/submit', authMiddleware, submitAttempt);

export default router;
```

## Key Conversion Points

1. **Route Parameters**: `[id]` → `:id`
2. **Request Body**: `await req.json()` → `req.body`
3. **Response**: `NextResponse.json()` → `res.json()`
4. **Auth**: `getAuth()` → middleware
5. **Error Handling**: `return NextResponse` → `res.status().json()`

## Migration Checklist

- [ ] Set up Express server with Bun
- [ ] Create authentication middleware
- [ ] Convert course routes
- [ ] Convert exam routes
- [ ] Convert flashcard routes
- [ ] Convert user routes
- [ ] Convert upload routes
- [ ] Add error handling
- [ ] Test all endpoints

This guide provides a systematic approach to migrate all your Next.js API routes to Express.js with Bun! 