export interface QuestionTypeCount { multipleChoice: number;
  trueFalse: number;
  passage: number;
  passageQuestions: number; }

export interface ChapterWithQuestionsCount { id: string;
  title: string;
  _count: {
    questions: number; };
  questionTypes: QuestionTypeCount;
}

export interface CourseWithQuestionsCount { id: string;
  title: string;
  chapters: ChapterWithQuestionsCount[];
  questionCount: number;
  questionTypes: QuestionTypeCount; }
