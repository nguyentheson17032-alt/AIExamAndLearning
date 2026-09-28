export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type RankCode = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type BloomLevel = "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type QuestionSource = "UPLOAD" | "MANUAL" | "AI_GENERATED";
export type PaperKind = "EXAM" | "ASSIGNMENT" | "PRACTICE";
export type PaperSource = "MANUAL" | "AI_GENERATED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";
export type EloReason =
  | "ATTEMPT_GRADED"
  | "AI_ADJUSTMENT"
  | "MANUAL"
  | "PRACTICE";
export type GradedBy = "AUTO" | "AI" | "TEACHER";

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
  title: string;
  kind: PaperKind;
  durationMinutes: number;
  status: ContentStatus;
};

export type SharePaperSetOption = {
  id: string;
  title: string;
  academicYear: string | null;
  paperCount: number;
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
