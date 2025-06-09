# Express.js Migration Guide with Bun

This guide shows how to convert all Next.js API routes to a standalone Express.js application using Bun runtime for optimal performance.

## Current API Routes Analysis

Based on your Next.js app, here are all the routes that need migration:

### Authentication Routes
- `app/api/auth/[...all]/route.ts` → Express auth handler

### Course Management
- `app/api/courses/route.ts` → `/api/courses` (GET, POST)
- `app/api/courses/[courseId]/route.ts` → `/api/courses/:courseId` (GET, PATCH, DELETE)
- `app/api/courses/[courseId]/publish/route.ts` → `/api/courses/:courseId/publish` (PATCH)
- `app/api/courses/[courseId]/unpublish/route.ts` → `/api/courses/:courseId/unpublish` (PATCH)
- `app/api/courses/[courseId]/checkout/route.ts` → `/api/courses/:courseId/checkout` (POST)

### Chapter Management
- `app/api/courses/[courseId]/chapters/route.ts` → `/api/courses/:courseId/chapters` (GET, POST)
- `app/api/courses/[courseId]/chapters/reorder/route.ts` → `/api/courses/:courseId/chapters/reorder` (PATCH)
- `app/api/courses/[courseId]/chapters/[chapterId]/route.ts` → `/api/courses/:courseId/chapters/:chapterId` (PATCH, DELETE)
- `app/api/courses/[courseId]/chapters/[chapterId]/publish/route.ts` → `/api/courses/:courseId/chapters/:chapterId/publish` (PATCH)
- `app/api/courses/[courseId]/chapters/[chapterId]/unpublish/route.ts` → `/api/courses/:courseId/chapters/:chapterId/unpublish` (PATCH)
- `app/api/courses/[courseId]/chapters/[chapterId]/progress/route.ts` → `/api/courses/:courseId/chapters/:chapterId/progress` (PATCH)

### Attachments
- `app/api/courses/[courseId]/attachments/route.ts` → `/api/courses/:courseId/attachments` (GET, POST)
- `app/api/courses/[courseId]/attachments/[attachmentId]/route.ts` → `/api/courses/:courseId/attachments/:attachmentId` (DELETE)

### Exam System
- `app/api/exam/route.ts` → `/api/exam` (GET, POST)
- `app/api/exam/[examId]/route.ts` → `/api/exam/:examId` (GET, PATCH, DELETE)
- `app/api/exam/[examId]/publish/route.ts` → `/api/exam/:examId/publish` (PATCH)
- `app/api/exam/[examId]/unpublish/route.ts` → `/api/exam/:examId/unpublish` (PATCH)
- `app/api/exam/[examId]/questions/route.ts` → `/api/exam/:examId/questions` (GET, POST)
- `app/api/exam/[examId]/questions/reorder/route.ts` → `/api/exam/:examId/questions/reorder` (PATCH)
- `app/api/exam/[examId]/questions/[questionId]/route.ts` → `/api/exam/:examId/questions/:questionId` (PATCH, DELETE)
- `app/api/exam/[examId]/statistics/route.ts` → `/api/exam/:examId/statistics` (GET)

### Exam Attempts
- `app/api/exam/attempt/route.ts` → `/api/exam/attempt` (POST)
- `app/api/exam/answer/route.ts` → `/api/exam/answer` (POST)
- `app/api/exam/[examId]/attempt/route.ts` → `/api/exam/:examId/attempt` (POST)
- `app/api/exam/[examId]/attempts/route.ts` → `/api/exam/:examId/attempts` (GET)
- `app/api/exam/[examId]/attempt/[attemptId]/submit/route.ts` → `/api/exam/:examId/attempt/:attemptId/submit` (POST)
- `app/api/exam/[examId]/attempts/[attemptId]/complete/route.ts` → `/api/exam/:examId/attempts/:attemptId/complete` (PATCH)

### Flashcards
- `app/api/flashcards/route.ts` → `/api/flashcards` (GET, POST)
- `app/api/flashcards/[flashcardId]/route.ts` → `/api/flashcards/:flashcardId` (PATCH, DELETE)
- `app/api/courses/[courseId]/flashcards/route.ts` → `/api/courses/:courseId/flashcards` (GET, POST)

### Practice System
- `app/api/practice/courses/route.ts` → `/api/practice/courses` (GET)
- `app/api/practice/questions/route.ts` → `/api/practice/questions` (GET)
- `app/api/practice/questions/create/route.ts` → `/api/practice/questions/create` (POST)

### User Management
- `app/api/user/permissions/route.ts` → `/api/user/permissions` (GET)
- `app/api/user/start-trial/route.ts` → `/api/user/start-trial` (POST)
- `app/api/user/[userId]/approval/route.ts` → `/api/user/:userId/approval` (PATCH)
- `app/api/user/[userId]/grant-access/route.ts` → `/api/user/:userId/grant-access` (PATCH)
- `app/api/user/[userId]/revoke-access/route.ts` → `/api/user/:userId/revoke-access` (PATCH)
- `app/api/user/[userId]/role/route.ts` → `/api/user/:userId/role` (PATCH)

### File Uploads
- `app/api/upload/route.ts` → `/api/upload` (POST)
- `app/api/image-processing/route.ts` → `/api/image-processing` (POST)

### AI & Utilities
- `app/api/ai-tutor/route.ts` → `/api/ai-tutor` (POST)
- `app/api/purchases/route.ts` → `/api/purchases` (GET)
- `app/api/webhook/route.ts` → `/api/webhook` (POST)

## Quick Start Setup

### 1. Project Structure
```
express-api/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── exams.ts
│   │   └── ...
│   ├── controllers/
│   ├── middleware/
│   └── lib/
├── package.json
└── .env
```

### 2. Install Dependencies
```bash
bun add express cors helmet compression morgan multer
bun add @types/express @types/cors @types/morgan @types/multer -d
```

### 3. Basic Express Setup

#### src/server.ts
```typescript
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import courseRoutes from './routes/courses';
import examRoutes from './routes/exams';
// ... other imports

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/exam', examRoutes);
// ... other routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. Convert Next.js Route to Express

#### Before (Next.js):
```typescript
// app/api/courses/route.ts
export async function GET(req: Request) {
  const { userId } = getAuth();
  // ... logic
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const { userId } = getAuth();
  const body = await req.json();
  // ... logic
  return NextResponse.json(course);
}
```

#### After (Express):
```typescript
// src/routes/courses.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // ... logic
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;
    // ... logic
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### 5. Authentication Middleware

#### src/middleware/auth.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import { getAuthenticatedUser } from '../lib/auth';

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

## Route Conversion Examples

### Course Routes
```typescript
// src/routes/courses.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/courses
router.get('/', getCourses);

// POST /api/courses
router.post('/', authMiddleware, createCourse);

// GET /api/courses/:courseId
router.get('/:courseId', getCourse);

// PATCH /api/courses/:courseId
router.patch('/:courseId', authMiddleware, updateCourse);

// DELETE /api/courses/:courseId
router.delete('/:courseId', authMiddleware, deleteCourse);

// PATCH /api/courses/:courseId/publish
router.patch('/:courseId/publish', authMiddleware, publishCourse);

// PATCH /api/courses/:courseId/unpublish
router.patch('/:courseId/unpublish', authMiddleware, unpublishCourse);

// Chapter routes
router.get('/:courseId/chapters', getChapters);
router.post('/:courseId/chapters', authMiddleware, createChapter);
router.patch('/:courseId/chapters/reorder', authMiddleware, reorderChapters);
router.patch('/:courseId/chapters/:chapterId', authMiddleware, updateChapter);
router.delete('/:courseId/chapters/:chapterId', authMiddleware, deleteChapter);
router.patch('/:courseId/chapters/:chapterId/publish', authMiddleware, publishChapter);
router.patch('/:courseId/chapters/:chapterId/unpublish', authMiddleware, unpublishChapter);
router.patch('/:courseId/chapters/:chapterId/progress', authMiddleware, updateProgress);

// Attachment routes
router.get('/:courseId/attachments', getAttachments);
router.post('/:courseId/attachments', authMiddleware, createAttachment);
router.delete('/:courseId/attachments/:attachmentId', authMiddleware, deleteAttachment);

// Flashcard routes
router.get('/:courseId/flashcards', authMiddleware, getCourseFlashcards);
router.post('/:courseId/flashcards', authMiddleware, createCourseFlashcard);

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
router.patch('/:examId/publish', authMiddleware, publishExam);
router.patch('/:examId/unpublish', authMiddleware, unpublishExam);

// Question management
router.get('/:examId/questions', getQuestions);
router.post('/:examId/questions', authMiddleware, createQuestion);
router.patch('/:examId/questions/reorder', authMiddleware, reorderQuestions);
router.patch('/:examId/questions/:questionId', authMiddleware, updateQuestion);
router.delete('/:examId/questions/:questionId', authMiddleware, deleteQuestion);

// Exam attempts
router.post('/attempt', authMiddleware, createAttempt);
router.post('/answer', authMiddleware, submitAnswer);
router.post('/:examId/attempt', authMiddleware, createExamAttempt);
router.get('/:examId/attempts', authMiddleware, getAttempts);
router.post('/:examId/attempt/:attemptId/submit', authMiddleware, submitAttempt);
router.patch('/:examId/attempts/:attemptId/complete', authMiddleware, completeAttempt);

// Statistics
router.get('/:examId/statistics', authMiddleware, getStatistics);

export default router;
```

## Key Differences to Handle

### 1. Request/Response Objects
- **Next.js**: `Request`/`NextResponse`
- **Express**: `req`/`res` objects

### 2. Route Parameters
- **Next.js**: `[courseId]` in file path
- **Express**: `:courseId` in route definition

### 3. Authentication
- **Next.js**: `getAuth()` from headers
- **Express**: Middleware that adds `user` to `req`

### 4. Error Handling
- **Next.js**: Return `NextResponse` with status
- **Express**: Use `res.status().json()`

### 5. Body Parsing
- **Next.js**: `await req.json()`
- **Express**: `req.body` (with middleware)

## Migration Checklist

- [ ] Set up basic Express server with Bun
- [ ] Create middleware for auth, CORS, etc.
- [ ] Convert course management routes
- [ ] Convert exam system routes
- [ ] Convert flashcard routes
- [ ] Convert user management routes
- [ ] Convert file upload routes
- [ ] Convert practice routes
- [ ] Set up error handling
- [ ] Add request logging
- [ ] Test all endpoints
- [ ] Set up production deployment

## Benefits of Migration

1. **Performance**: Bun runtime is faster than Node.js
2. **Separation**: API separate from frontend
3. **Scalability**: Independent scaling of API
4. **Deployment**: Multiple deployment options
5. **Testing**: Easier to test standalone API

This guide provides the foundation to systematically migrate all your Next.js API routes to Express.js with Bun! 