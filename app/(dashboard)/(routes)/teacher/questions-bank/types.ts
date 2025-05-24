export interface ChapterWithQuestionsCount {
  id: string;
  title: string;
  _count: {
    PracticeQuestion: number;
  };
}

export interface CourseWithQuestionsCount {
  id: string;
  title: string;
  chapters: ChapterWithQuestionsCount[];
  questionCount: number;
}
