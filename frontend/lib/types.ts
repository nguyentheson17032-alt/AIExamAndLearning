export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type RankCode = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type BloomLevel = "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type QuestionSource = "UPLOAD" | "MANUAL" | "AI_GENERATED";
export type PaperKind = "EXAM" | "ASSIGNMENT" | "PRACTICE" | "PROMOTION";
export type PaperSource = "MANUAL" | "AI_GENERATED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";
export type EloReason =
  | "ATTEMPT_GRADED"
  | "AI_ADJUSTMENT"
  | "MANUAL"
  | "PRACTICE";
export type GradedBy = "AUTO" | "AI" | "TEACHER";

export type PromotionStatusResponse = {
  currentRank: RankCode;
  targetRank: RankCode | null;
  currentElo: number;
  minEloThreshold: number;
  eligible: boolean;
  difficulty: Difficulty | null;
  questionCount: number;
  durationMinutes: number;
  minPassingRatio: number;
  requiredWins: number;
  currentWins: number;
  maxRankReached: boolean;
  description: string;
};

export type SessionUser = {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  eloRating: number;
  rankCode: RankCode;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  eloRating: number;
  rankCode: RankCode;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  eloRating: number;
  rankCode: RankCode;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type Topic = {
  id: string;
  subjectId: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type Choice = {
  id: string;
  label: string;
  content: string;
  correct: boolean;
  sortOrder: number;
};

export type Question = {
  id: string;
  authorId: string;
  subjectId: string;
  topicId: string | null;
  similarToQuestionId: string | null;
  type: QuestionType;
  stem: string;
  answerKey: string | null;
  explanation: string | null;
  difficulty: Difficulty;
  eloRating: number;
  bloomLevel: BloomLevel | null;
  source: QuestionSource;
  status: ContentStatus;
  stemImageId?: string | null;
  explanationImageId?: string | null;
  choices: Choice[];
  createdAt: string;
};

export type PaperItem = {
  questionId: string;
  sortOrder: number;
  points: number;
  sectionCode: "PART_I" | "PART_II" | "PART_III" | null;
  sectionTitle: string | null;
  itemLabel: string | null;
  groupKey: string | null;
  question: Question;
};

export type ClassroomSummary = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  memberCount: number;
  createdAt: string;
};

export type ClassroomMember = {
  studentId: string;
  displayName: string;
  joinedAt: string | null;
};

export type ClassPaper = {
  id: string;
  subjectId: string;
  subjectName?: string | null;
  subjectCode?: string | null;
  title: string;
  kind: PaperKind;
  durationMinutes: number;
  status: ContentStatus;
  questionCount?: number;
  difficulty?: Difficulty;
  targetEloMin?: number;
  targetEloMax?: number;
  examNumber?: number | null;
  questionTypes?: QuestionType[];
  inClass?: boolean;
};

export type SharePaperSetOption = {
  id: string;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectCode?: string | null;
  title: string;
  academicYear: string | null;
  paperCount: number;
  papers?: ClassPaper[];
};

export type ShareOptions = {
  papers: ClassPaper[];
  paperSets: SharePaperSetOption[];
};

export type ClassroomDetail = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  teacher: boolean;
  members: ClassroomMember[];
  papers: ClassPaper[];
};

export type Paper = {
  id: string;
  authorId: string;
  subjectId: string;
  paperSetId: string | null;
  examNumber: number | null;
  title: string;
  description: string | null;
  kind: PaperKind;
  source: PaperSource;
  durationMinutes: number;
  targetEloMin: number;
  targetEloMax: number;
  status: ContentStatus;
  questions: PaperItem[];
  createdAt: string;
  updatedAt: string | null;
};

export type PaperSetItem = {
  id: string;
  examNumber: number | null;
  title: string;
  durationMinutes: number;
  questionCount: number;
};

export type PaperSet = {
  id: string;
  authorId: string;
  subjectId: string;
  title: string;
  academicYear: string | null;
  description: string | null;
  status: ContentStatus;
  paperCount: number;
  createdAt: string;
  papers: PaperSetItem[];
};

export type AttemptAnswer = {
  questionId: string;
  selectedChoiceId: string | null;
  textAnswer: string | null;
  correct: boolean | null;
  score: number | null;
  aiFeedback: string | null;
  gradedBy: GradedBy | null;
};

export type Attempt = {
  id: string;
  userId: string;
  paperId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  score: number | null;
  maxScore: number | null;
  eloBefore: number | null;
  eloAfter: number | null;
  eloDelta: number | null;
  rankAfter: RankCode | null;
  answers: AttemptAnswer[];
};

export type EloEvent = {
  id: string;
  attemptId: string | null;
  ratingBefore: number;
  ratingAfter: number;
  delta: number;
  reason: EloReason;
  rankAfter: RankCode;
  createdAt: string;
};

export type ProblemDetail = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
};

export type PhysicsCategory =
  | "mechanics"
  | "oscillation_wave"
  | "circuits_electromagnetism"
  | "optics"
  | "thermodynamics"
  | "nuclear_quantum";

export type MathCategory =
  | "linear"
  | "quadratic"
  | "system"
  | "word_problem"
  | "ai_challenge"
  | PhysicsCategory
  | "all";
export type MathDifficulty = "easy" | "medium" | "hard";

export type MathExercise = {
  id: string;
  category: string;
  category_name: string;
  difficulty: string;
  title: string;
  question: string;
  hints: string[];
  solution: string;
  final_answer: string;
  numeric_answer: string;
  roots: number[];
  options?: string[];
  correct_option?: number;
  plot_info?: Record<string, unknown> | null;
  elo?: number;
  eloRating?: number;
  subject_name?: string;
};

export type MathEvaluateResult = {
  is_correct: boolean;
  score: number;
  feedback: string;
  user_answer: string;
  correct_answer: string;
  solution: string;
};

export type AiPredictModelInfo = {
  target_formula: string;
  exact_value: number;
  ai_predicted_value: number;
  error: number;
  confidence: number;
};

export type AiPredictResponse = {
  x: number;
  linear_model: AiPredictModelInfo;
  mlp_model: AiPredictModelInfo;
};

export type AdminStats = {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalQuestions: number;
  totalPapers: number;
  totalAiExams: number;
  totalAttempts: number;
  rankDistribution: Record<string, number>;
};

export type AdminStudent = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  eloRating: number;
  rankCode: RankCode;
  enabled: boolean;
  createdAt: string;
  totalAttempts: number;
};

export type AdminTeacher = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
  classroomsCount: number;
  papersCount: number;
};

export type AdminClassroom = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  memberCount: number;
  paperCount: number;
  createdAt: string;
};

export type AdminAiExam = {
  id: string;
  title: string;
  subjectId: string | null;
  subjectName: string;
  kind: PaperKind;
  source: PaperSource;
  durationMinutes: number;
  targetEloMin: number;
  targetEloMax: number;
  questionCount: number;
  status: ContentStatus;
  createdAt: string;
  authorName: string;
};

export type AdminStudentAttemptSummary = {
  id: string;
  paperId: string;
  paperTitle: string;
  subjectName: string;
  score: number | null;
  maxScore: number | null;
  eloBefore: number | null;
  eloAfter: number | null;
  eloDelta: number | null;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
};

export type AdminStudentEloHistorySummary = {
  id: string;
  ratingBefore: number;
  ratingAfter: number;
  delta: number;
  reason: EloReason;
  createdAt: string;
  attemptId: string | null;
  paperTitle: string | null;
};

export type AdminStudentDetail = AdminStudent & {
  attempts: AdminStudentAttemptSummary[];
  eloHistory: AdminStudentEloHistorySummary[];
};

export type AdminClassMemberSummary = {
  studentId: string;
  displayName: string;
  email: string;
  eloRating: number;
  rankCode: RankCode;
  joinedAt: string;
};

export type AdminClassPaperSummary = {
  paperId: string;
  title: string;
  subjectName: string;
  durationMinutes: number;
  questionCount: number;
  status: ContentStatus;
  assignedAt: string;
};

export type AdminClassroomDetail = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  members: AdminClassMemberSummary[];
  papers: AdminClassPaperSummary[];
};


