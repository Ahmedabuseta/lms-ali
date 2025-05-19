// import { Flashcard } from "@prisma/client";
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const database = new PrismaClient();

// Mock user ID for course creation - you should replace this with a real user ID
const TEACHER_ID = "user_2NNPrJQXvxJ4T3c1kuKpVxfnTw8";

async function main() {
  try {
    console.log('🌱 Starting seed process...');
    
    // Clear existing data to avoid conflicts
    console.log('Cleaning up existing data...');
    await cleanDatabase();
    
    // Create categories (English, Math, Geography, French)
    console.log('Creating categories...');
    const categories = await createCategories();
    
    // Create courses for each category
    console.log('Creating courses...');
    const courses = await createCourses(categories);
    
    // Create chapters for each course
    console.log('Creating chapters...');
    const chapters = await createChapters(courses);
    
    // Create flashcards
    console.log('Creating flashcards...');
    await createFlashcards(chapters, courses);
    
    // Create practice questions
    console.log('Creating practice questions...');
    await createPracticeQuestions(chapters, courses);
    
    // Create exams
    console.log('Creating exams...');
    await createExams(chapters, courses);
    
    console.log('🟢 Seed script run successfully!🟢');
  } catch (error) {
    console.log('🔴 Error in seed script 🔴', error);
  } finally {
    await database.$disconnect();
  }
}

async function cleanDatabase() {
  // Delete in correct order to maintain referential integrity
  await database.questionAttempt.deleteMany({});
  await database.examAttempt.deleteMany({});
  await database.option.deleteMany({});
  await database.question.deleteMany({});
  await database.exam.deleteMany({});
  await database.practiceOption.deleteMany({});
  await database.practiceQuestion.deleteMany({});
  await database.flashcard.deleteMany({});
  await database.userProgress.deleteMany({});
  await database.muxData.deleteMany({});
  await database.chapter.deleteMany({});
  await database.attachment.deleteMany({});
  await database.purchase.deleteMany({});
  await database.course.deleteMany({});
  await database.category.deleteMany({});
}

async function createCategories() {
  const categories = await database.category.createMany({
    data: [
      { name: 'English' },
      { name: 'Math' },
      { name: 'Geography' },
      { name: 'French' },
    ],
  });
  
  return await database.category.findMany({});
}

async function createCourses(categories) {
  const courses = [];
  
  // English Course
  courses.push(await database.course.create({
    data: {
      title: "Advanced English Grammar and Composition",
      description: "Master English grammar, writing, and composition skills with this comprehensive course.",
      imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000",
      price: 49.99,
      isPublished: true,
      categoryId: categories.find(c => c.name === "English").id,
      //createdById: TEACHER_ID,
    }
  }));
  
  // Math Course
  courses.push(await database.course.create({
    data: {
      title: "Mathematics Fundamentals: Algebra to Calculus",
      description: "Build a strong foundation in mathematics from algebra to advanced calculus with practical applications.",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000",
      price: 59.99,
      isPublished: true,
      categoryId: categories.find(c => c.name === "Math").id,
      //createdById: TEACHER_ID,
    }
  }));
  
  // Geography Course
  courses.push(await database.course.create({
    data: {
      title: "World Geography: Continents, Countries and Cultures",
      description: "Explore the world's geography, understanding landforms, countries, cultures and global connections.",
      imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000",
      price: 44.99,
      isPublished: true,
      categoryId: categories.find(c => c.name === "Geography").id,
      //createdById: TEACHER_ID,
    }
  }));
  
  // French Course
  courses.push(await database.course.create({
    data: {
      title: "French Language: From Beginner to Conversational",
      description: "Learn French from scratch and develop conversational fluency with native speakers.",
      imageUrl: "https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=1000",
      price: 54.99,
      isPublished: true,
      categoryId: categories.find(c => c.name === "French").id,
      //createdById: TEACHER_ID,
    }
  }));
  
  return courses;
}

async function createChapters(courses) {
  const chapters = [];
  
  // English Course Chapters
  const englishCourse = courses.find(c => c.title.includes("English"));
  const englishChapters = [
    { title: "Grammar Foundations", description: "Essential grammar rules and structures", isFree: true, position: 1 },
    { title: "Writing Effective Essays", description: "Structure, style and persuasive writing techniques", isFree: false, position: 2 },
    { title: "Literary Analysis", description: "How to analyze and interpret literature", isFree: false, position: 3 },
    { title: "Professional Communication", description: "Business writing and formal communication", isFree: false, position: 4 },
  ];
  
  // Math Course Chapters
  const mathCourse = courses.find(c => c.title.includes("Mathematics"));
  const mathChapters = [
    { title: "Algebra Fundamentals", description: "Core concepts of algebraic expressions and equations", isFree: true, position: 1 },
    { title: "Geometry and Trigonometry", description: "Shapes, angles, and trigonometric functions", isFree: false, position: 2 },
    { title: "Calculus: Derivatives", description: "Introduction to differential calculus", isFree: false, position: 3 },
    { title: "Calculus: Integrals", description: "Understanding integration and its applications", isFree: false, position: 4 },
  ];
  
  // Geography Course Chapters
  const geographyCourse = courses.find(c => c.title.includes("Geography"));
  const geographyChapters = [
    { title: "World Map and Continents", description: "Understanding global geography", isFree: true, position: 1 },
    { title: "Climate Zones and Weather Patterns", description: "How climate shapes our world", isFree: false, position: 2 },
    { title: "Cultural Geography", description: "How human cultures interact with environments", isFree: false, position: 3 },
    { title: "Economic Geography", description: "Resources, trade, and global economics", isFree: false, position: 4 },
  ];
  
  // French Course Chapters
  const frenchCourse = courses.find(c => c.title.includes("French"));
  const frenchChapters = [
    { title: "Basic Vocabulary and Pronunciation", description: "First words and proper pronunciation", isFree: true, position: 1 },
    { title: "Grammar and Sentence Structure", description: "Building proper French sentences", isFree: false, position: 2 },
    { title: "Conversational French", description: "Everyday dialogues and expressions", isFree: false, position: 3 },
    { title: "French Culture and Literature", description: "Understanding French society and classic literature", isFree: false, position: 4 },
  ];
  
  // Create English chapters
  for (const chapterData of englishChapters) {
    chapters.push(await database.chapter.create({
      data: {
        ...chapterData,
        courseId: englishCourse.id,
        isPublished: true,
      }
    }));
  }
  
  // Create Math chapters
  for (const chapterData of mathChapters) {
    chapters.push(await database.chapter.create({
      data: {
        ...chapterData,
        courseId: mathCourse.id,
        isPublished: true,
      }
    }));
  }
  
  // Create Geography chapters
  for (const chapterData of geographyChapters) {
    chapters.push(await database.chapter.create({
      data: {
        ...chapterData,
        courseId: geographyCourse.id,
        isPublished: true,
      }
    }));
  }
  
  // Create French chapters
  for (const chapterData of frenchChapters) {
    chapters.push(await database.chapter.create({
      data: {
        ...chapterData,
        courseId: frenchCourse.id,
        isPublished: true,
      }
    }));
  }
  
  return chapters;
}

async function createFlashcards(chapters, courses) {
  // English flashcards
  const englishCourse = courses.find(c => c.title.includes("English"));
  const englishChapters = chapters.filter(c => c.courseId === englishCourse.id);
  
  const englishFlashcards = [
    // Grammar Foundations
    { question: "What is a noun?", answer: "A person, place, thing, or idea.", chapterId: englishChapters[0].id },
    { question: "What is a verb?", answer: "An action word or state of being.", chapterId: englishChapters[0].id },
    { question: "What is an adjective?", answer: "A word that describes a noun.", chapterId: englishChapters[0].id },
    { question: "What are the four types of sentences?", answer: "Declarative, interrogative, imperative, and exclamatory.", chapterId: englishChapters[0].id },
    { question: "What is a preposition?", answer: "A word that shows the relationship between a noun/pronoun and other words in a sentence.", chapterId: englishChapters[0].id },
    
    // Writing Effective Essays
    { question: "What are the three main parts of an essay?", answer: "Introduction, body, and conclusion.", chapterId: englishChapters[1].id },
    { question: "What is a thesis statement?", answer: "A sentence that states the main argument or point of your essay.", chapterId: englishChapters[1].id },
    { question: "What is a topic sentence?", answer: "The first sentence of a paragraph that introduces its main idea.", chapterId: englishChapters[1].id },
    { question: "What is a transition word?", answer: "A word or phrase that helps connect ideas between sentences or paragraphs.", chapterId: englishChapters[1].id },
    { question: "What is the purpose of a conclusion?", answer: "To summarize main points and provide closure to the essay.", chapterId: englishChapters[1].id },
  ];
  
  // Math flashcards
  const mathCourse = courses.find(c => c.title.includes("Mathematics"));
  const mathChapters = chapters.filter(c => c.courseId === mathCourse.id);
  
  const mathFlashcards = [
    // Algebra Fundamentals
    { question: "What is the quadratic formula?", answer: "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$", chapterId: mathChapters[0].id },
    { question: "What does FOIL stand for in algebra?", answer: "First, Outer, Inner, Last - a method for multiplying binomials.", chapterId: mathChapters[0].id },
    { question: "What is a linear equation?", answer: "An equation that forms a straight line when graphed, typically in the form $y = mx + b$.", chapterId: mathChapters[0].id },
    { question: "What is the slope-intercept form?", answer: "$y = mx + b$, where $m$ is the slope and $b$ is the y-intercept.", chapterId: mathChapters[0].id },
    { question: "How do you factor $x^2 + 5x + 6$?", answer: "$(x + 2)(x + 3)$", chapterId: mathChapters[0].id },
    
    // Calculus: Derivatives
    { question: "What is the derivative of $x^n$?", answer: "$\\frac{d}{dx}(x^n) = nx^{n-1}$", chapterId: mathChapters[2].id },
    { question: "What is the product rule?", answer: "$\\frac{d}{dx}[f(x) \\cdot g(x)] = f'(x) \\cdot g(x) + f(x) \\cdot g'(x)$", chapterId: mathChapters[2].id },
    { question: "What is the chain rule?", answer: "$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$", chapterId: mathChapters[2].id },
    { question: "What is the derivative of $\\sin(x)$?", answer: "$\\frac{d}{dx}\\sin(x) = \\cos(x)$", chapterId: mathChapters[2].id },
    { question: "What is the derivative of $e^x$?", answer: "$\\frac{d}{dx}e^x = e^x$", chapterId: mathChapters[2].id },
  ];
  
  // Geography flashcards
  const geographyCourse = courses.find(c => c.title.includes("Geography"));
  const geographyChapters = chapters.filter(c => c.courseId === geographyCourse.id);
  
  const geographyFlashcards = [
    // World Map and Continents
    { question: "What are the seven continents?", answer: "Asia, Africa, North America, South America, Antarctica, Europe, and Australia/Oceania.", chapterId: geographyChapters[0].id },
    { question: "What is the largest ocean?", answer: "The Pacific Ocean.", chapterId: geographyChapters[0].id },
    { question: "What is the highest mountain in the world?", answer: "Mount Everest, at 8,848 meters (29,029 feet) above sea level.", chapterId: geographyChapters[0].id },
    { question: "Which country has the most land borders?", answer: "China and Russia, each bordering 14 other countries.", chapterId: geographyChapters[0].id },
    { question: "What is the longest river in the world?", answer: "The Nile River, at approximately 6,650 kilometers (4,130 miles).", chapterId: geographyChapters[0].id },
    
    // Climate Zones
    { question: "What are the three main climate zones?", answer: "Tropical, Temperate, and Polar.", chapterId: geographyChapters[1].id },
    { question: "What causes seasons?", answer: "The tilt of Earth's axis as it orbits around the sun.", chapterId: geographyChapters[1].id },
    { question: "What is the Equator?", answer: "An imaginary line dividing Earth into Northern and Southern Hemispheres at 0 degrees latitude.", chapterId: geographyChapters[1].id },
    { question: "What is a monsoon?", answer: "A seasonal change in wind direction that brings heavy rainfall in tropical regions.", chapterId: geographyChapters[1].id },
    { question: "What is the difference between weather and climate?", answer: "Weather refers to short-term atmospheric conditions; climate refers to average weather patterns over a long period.", chapterId: geographyChapters[1].id },
  ];
  
  // French flashcards
  const frenchCourse = courses.find(c => c.title.includes("French"));
  const frenchChapters = chapters.filter(c => c.courseId === frenchCourse.id);
  
  const frenchFlashcards = [
    // Basic Vocabulary
    { question: "How do you say 'hello' in French?", answer: "Bonjour", chapterId: frenchChapters[0].id },
    { question: "How do you say 'thank you' in French?", answer: "Merci", chapterId: frenchChapters[0].id },
    { question: "How do you say 'yes' in French?", answer: "Oui", chapterId: frenchChapters[0].id },
    { question: "How do you say 'no' in French?", answer: "Non", chapterId: frenchChapters[0].id },
    { question: "How do you say 'goodbye' in French?", answer: "Au revoir", chapterId: frenchChapters[0].id },
    
    // French Grammar
    { question: "What are the definite articles in French?", answer: "Le (masculine), La (feminine), Les (plural)", chapterId: frenchChapters[1].id },
    { question: "What is the difference between 'tu' and 'vous'?", answer: "'Tu' is informal and used with friends/family, while 'vous' is formal or plural.", chapterId: frenchChapters[1].id },
    { question: "How do you form a question in French?", answer: "By inverting the subject and verb, using 'est-ce que', or raising intonation at the end.", chapterId: frenchChapters[1].id },
    { question: "What are the basic subject pronouns in French?", answer: "Je (I), Tu (you informal), Il/Elle (he/she), Nous (we), Vous (you formal/plural), Ils/Elles (they)", chapterId: frenchChapters[1].id },
    { question: "How do you form the present tense of -er verbs?", answer: "Remove -er and add: -e, -es, -e, -ons, -ez, -ent", chapterId: frenchChapters[1].id },
  ];
  
  // Create flashcards
  const allFlashcards = [...englishFlashcards, ...mathFlashcards, ...geographyFlashcards, ...frenchFlashcards];
  console.log(`Creating ${allFlashcards.length} flashcards...`);
  
  // Use raw SQL for creating flashcards to bypass schema validation
  for (const flashcard of allFlashcards) {
    try {
      const chapter = chapters.find(c => c.id === flashcard.chapterId);
      if (!chapter) {
        console.error(`Chapter not found for ID: ${flashcard.chapterId}`);
        continue;
      }
      
      // Get the course for this chapter
      const courseId = chapter.courseId;
      console.log(`Creating flashcard with courseId: ${courseId}`);
      
      // Execute raw SQL query to bypass Prisma validation
      // This adds the courseId directly to satisfy the database constraint
      const createdFlashcard = await database.$queryRaw`
        INSERT INTO "Flashcard" ("id", "question", "answer", "chapterId", "courseId", "createdAt", "updatedAt")
        VALUES (${crypto.randomUUID()}, ${flashcard.question}, ${flashcard.answer}, ${flashcard.chapterId}, ${courseId}, NOW(), NOW())
        RETURNING "id"
      `;
      
      // Now create the many-to-many relationship
      await database.$queryRaw`
        INSERT INTO "_CourseToFlashcard" ("A", "B")
        VALUES (${courseId}, ${createdFlashcard[0].id})
      `;
      
    } catch (error) {
      console.error("Error creating flashcard:", error);
    }
  }
}

async function createPracticeQuestions(chapters, courses) {
  // English practice questions
  const englishCourse = courses.find(c => c.title.includes("English"));
  const englishChapters = chapters.filter(c => c.courseId === englishCourse.id);
  
  await createMultipleChoiceQuestion(
    "Which of the following is NOT a part of speech?",
    ["Conjunction", "Preposition", "Narrative", "Adverb"],
    2, // Correct option index (0-based)
    "Medium",
    englishCourse.id,
    englishChapters[0].id
  );
  
  await createMultipleChoiceQuestion(
    "Which sentence has correct subject-verb agreement?",
    ["The team are playing well.", "The committee have decided.", "The data is inconclusive.", "Each of the students have completed the test."],
    2, // Correct option index (0-based)
    "Hard",
    englishCourse.id,
    englishChapters[0].id
  );
  
  // Math practice questions
  const mathCourse = courses.find(c => c.title.includes("Mathematics"));
  const mathChapters = chapters.filter(c => c.courseId === mathCourse.id);
  
  await createMultipleChoiceQuestion(
    "Solve for x: $3x + 7 = 22$",
    ["$x = 5$", "$x = 6$", "$x = 7$", "$x = 8$"],
    0, // Correct option index (0-based)
    "Easy",
    mathCourse.id,
    mathChapters[0].id
  );
  
  await createMultipleChoiceQuestion(
    "What is the derivative of $f(x) = x^3 + 2x^2 - 4x + 7$?",
    ["$f'(x) = 3x^2 + 4x - 4$", "$f'(x) = 3x^2 + 2x - 4$", "$f'(x) = 3x^2 + 4x - 1$", "$f'(x) = 2x^2 + 4x - 4$"],
    0, // Correct option index (0-based)
    "Medium",
    mathCourse.id,
    mathChapters[2].id
  );
  
  // Geography practice questions
  const geographyCourse = courses.find(c => c.title.includes("Geography"));
  const geographyChapters = chapters.filter(c => c.courseId === geographyCourse.id);
  
  await createMultipleChoiceQuestion(
    "Which of these countries is landlocked?",
    ["Paraguay", "Chile", "Ecuador", "Uruguay"],
    0, // Correct option index (0-based)
    "Medium",
    geographyCourse.id,
    geographyChapters[0].id
  );
  
  await createMultipleChoiceQuestion(
    "What type of climate is characterized by hot, wet summers and mild, dry winters?",
    ["Tropical", "Mediterranean", "Tundra", "Desert"],
    1, // Correct option index (0-based)
    "Medium",
    geographyCourse.id,
    geographyChapters[1].id
  );
  
  // French practice questions
  const frenchCourse = courses.find(c => c.title.includes("French"));
  const frenchChapters = chapters.filter(c => c.courseId === frenchCourse.id);
  
  await createMultipleChoiceQuestion(
    "What is the correct translation of 'I eat breakfast in the morning'?",
    ["Je mange le petit déjeuner dans le matin.", "Je mange le petit déjeuner le matin.", "Je prends le petit déjeuner le matin.", "Je prends le petit déjeuner dans la matin."],
    2, // Correct option index (0-based)
    "Medium",
    frenchCourse.id,
    frenchChapters[0].id
  );
  
  await createMultipleChoiceQuestion(
    "Which is the correct conjugation of 'parler' (to speak) for 'nous'?",
    ["parlons", "parles", "parlez", "parlent"],
    0, // Correct option index (0-based)
    "Easy",
    frenchCourse.id,
    frenchChapters[1].id
  );
}

async function createMultipleChoiceQuestion(text, options, correctIndex, difficulty, courseId, chapterId) {
  const practiceQuestion = await database.practiceQuestion.create({
    data: {
      text,
      type: "MULTIPLE_CHOICE",
      difficulty,
      courseId,
      chapterId,
    }
  });
  
  // Create options
  for (let i = 0; i < options.length; i++) {
    await database.practiceOption.create({
      data: {
        text: options[i],
        isCorrect: i === correctIndex,
        questionId: practiceQuestion.id
      }
    });
  }
  
  return practiceQuestion;
}

async function createExams(chapters, courses) {
  // English exam
  const englishCourse = courses.find(c => c.title.includes("English"));
  const englishChapters = chapters.filter(c => c.courseId === englishCourse.id);

  const englishExam = await database.exam.create({
    data: {
      title: "English Grammar and Composition Final",
      description: "Comprehensive exam covering grammar, writing techniques, and analysis.",
      timeLimit: 60, // 60 minutes
      isPublished: true,
      courseId: englishCourse.id,
      chapterId: null, // Course-wide exam
    }
  });
  
  // Create English exam questions
  await createExamQuestion(
    englishExam.id,
    "Which of these is an example of a compound sentence?",
    "MULTIPLE_CHOICE",
    [
      { text: "After I finish my homework, I will go to the movie.", isCorrect: false },
      { text: "I went to the store, and I bought some milk.", isCorrect: true },
      { text: "Running quickly, she caught the bus.", isCorrect: false },
      { text: "The man who lives next door is a doctor.", isCorrect: false },
    ]
  );
  
  await createExamQuestion(
    englishExam.id,
    "The passive voice should be avoided in most writing.",
    "TRUE_FALSE",
    [
      { text: "True", isCorrect: true },
      { text: "False", isCorrect: false },
    ]
  );
  
  // Math exam
  const mathCourse = courses.find(c => c.title.includes("Mathematics"));
  const mathChapters = chapters.filter(c => c.courseId === mathCourse.id);
  
  const mathExam = await database.exam.create({
    data: {
      title: "Calculus Fundamentals Exam",
      description: "Test your understanding of derivatives, integrals, and applications.",
      timeLimit: 90, // 90 minutes
      isPublished: true,
      courseId: mathCourse.id,
      chapterId: mathChapters[2].id, // Linked to Calculus chapter
    }
  });
  
  // Create Math exam questions
  await createExamQuestion(
    mathExam.id,
    "Find the derivative of $f(x) = 2x^3 - 3x^2 + 4x - 7$.",
    "MULTIPLE_CHOICE",
    [
      { text: "$f'(x) = 6x^2 - 6x + 4$", isCorrect: true },
      { text: "$f'(x) = 6x^2 - 9x + 4$", isCorrect: false },
      { text: "$f'(x) = 6x^2 - 6x - 4$", isCorrect: false },
      { text: "$f'(x) = 8x^3 - 6x + 4$", isCorrect: false },
    ]
  );
  
  await createExamQuestion(
    mathExam.id,
    "The derivative of a constant is always zero.",
    "TRUE_FALSE",
    [
      { text: "True", isCorrect: true },
      { text: "False", isCorrect: false },
    ]
  );
  
  // Geography exam
  const geographyCourse = courses.find(c => c.title.includes("Geography"));
  const geographyChapters = chapters.filter(c => c.courseId === geographyCourse.id);
  
  const geographyExam = await database.exam.create({
    data: {
      title: "World Geography Assessment",
      description: "Test your knowledge of countries, climate zones, and geographic features.",
      timeLimit: 45, // 45 minutes
      isPublished: true,
      courseId: geographyCourse.id,
      chapterId: null, // Course-wide exam
    }
  });
  
  // Create Geography exam questions
  await createExamQuestion(
    geographyExam.id,
    "Which of these countries is NOT in South America?",
    "MULTIPLE_CHOICE",
    [
      { text: "Colombia", isCorrect: false },
      { text: "Panama", isCorrect: true },
      { text: "Bolivia", isCorrect: false },
      { text: "Paraguay", isCorrect: false },
    ]
  );
  
  await createExamQuestion(
    geographyExam.id,
    "The Amazon River is the longest river in the world.",
    "TRUE_FALSE",
    [
      { text: "True", isCorrect: false },
      { text: "False", isCorrect: true },
    ]
  );
  
  // French exam
  const frenchCourse = courses.find(c => c.title.includes("French"));
  const frenchChapters = chapters.filter(c => c.courseId === frenchCourse.id);
  
  const frenchExam = await database.exam.create({
    data: {
      title: "French Language Proficiency Test",
      description: "Evaluate your French vocabulary, grammar, and comprehension skills.",
      timeLimit: 60, // 60 minutes
      isPublished: true,
      courseId: frenchCourse.id,
      chapterId: null, // Course-wide exam
    }
  });
  
  // Create French exam questions
  await createExamQuestion(
    frenchExam.id,
    "Choose the correct translation for: 'I would like to order a coffee, please.'",
    "MULTIPLE_CHOICE",
    [
      { text: "Je veux un café, s'il vous plaît.", isCorrect: false },
      { text: "Je voudrais commander un café, s'il vous plaît.", isCorrect: true },
      { text: "Je peux avoir un café, s'il vous plaît.", isCorrect: false },
      { text: "Je prends un café, s'il vous plaît.", isCorrect: false },
    ]
  );
  
  await createExamQuestion(
    frenchExam.id,
    "In French, adjectives usually come before the noun they describe.",
    "TRUE_FALSE",
    [
      { text: "True", isCorrect: false },
      { text: "False", isCorrect: true },
    ]
  );
}

async function createExamQuestion(examId, text, type, options) {
  const question = await database.question.create({
    data: {
      text,
      type,
      examId,
      points: 1, // Default point value
    }
  });
  
  // Create options
  for (const option of options) {
    await database.option.create({
      data: {
        text: option.text,
        isCorrect: option.isCorrect,
        questionId: question.id
      }
    });
  }
  
  return question;
}

main();
