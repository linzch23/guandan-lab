import { type Static, Type } from "@sinclair/typebox";

const Id = Type.String({ pattern: "^[a-z][a-z0-9-]*$" });
const IsoDate = Type.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" });
const CardCode = Type.String({ pattern: "^(?:[SHCD]-(?:[2-9]|10|[JQKA])|BJ|RJ)$" });
const TrackId = Type.Union([Type.Literal("beginner"), Type.Literal("skills")]);
const Difficulty = Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)]);

export const ReviewMetaSchema = Type.Object({
  status: Type.Union([Type.Literal("draft"), Type.Literal("approved")]),
  reviewer: Type.Optional(Type.String({ minLength: 1 })),
  reviewedAt: Type.Optional(IsoDate),
});

export const SourceSchema = Type.Object({
  id: Id,
  title: Type.String({ minLength: 1 }),
  publisher: Type.String({ minLength: 1 }),
  publishedAt: Type.Optional(IsoDate),
  url: Type.String({ pattern: "^https?://" }),
  accessedAt: IsoDate,
  license: Type.Optional(Type.String({ minLength: 1 })),
});

export const SkillSchema = Type.Object({
  id: Id,
  title: Type.String({ minLength: 1 }),
  group: Type.Union([
    Type.Literal("rules"),
    Type.Literal("basic-strategy"),
    Type.Literal("memory"),
    Type.Literal("partnership"),
    Type.Literal("advanced"),
  ]),
  description: Type.String({ minLength: 1 }),
  order: Type.Integer({ minimum: 1 }),
  availability: Type.Union([Type.Literal("available"), Type.Literal("roadmap")]),
});

export const TrackSchema = Type.Object({
  id: TrackId,
  title: Type.String({ minLength: 1 }),
  description: Type.String({ minLength: 1 }),
  lessonIds: Type.Array(Id, { minItems: 1, uniqueItems: true }),
  assessmentQuestionIds: Type.Array(Id, { minItems: 10, maxItems: 10, uniqueItems: true }),
});

export const LessonFrontmatterSchema = Type.Object({
  schemaVersion: Type.Literal(1),
  id: Id,
  trackId: TrackId,
  title: Type.String({ minLength: 1 }),
  summary: Type.String({ minLength: 1 }),
  order: Type.Integer({ minimum: 1 }),
  durationMinutes: Type.Integer({ minimum: 1, maximum: 60 }),
  objectives: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  skillIds: Type.Array(Id, { minItems: 1, uniqueItems: true }),
  checkpointQuestionIds: Type.Array(Id, { minItems: 1, uniqueItems: true }),
  sourceIds: Type.Array(Id, { minItems: 1, uniqueItems: true }),
  review: ReviewMetaSchema,
});

export const CardBlockSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  levelRank: Type.Optional(Type.String({ pattern: "^(?:[2-9]|10|[JQKA])$" })),
  groups: Type.Array(
    Type.Object({
      label: Type.String({ minLength: 1 }),
      cards: Type.Array(CardCode, { minItems: 1, maxItems: 27 }),
    }),
    { minItems: 1, maxItems: 4 },
  ),
});

const OptionSchema = Type.Object({ id: Id, label: Type.String({ minLength: 1 }) });
const CommonQuizFields = {
  schemaVersion: Type.Literal(1),
  id: Id,
  trackId: TrackId,
  difficulty: Difficulty,
  prompt: Type.String({ minLength: 1 }),
  skillIds: Type.Array(Id, { minItems: 1, uniqueItems: true }),
  lessonIds: Type.Array(Id, { minItems: 1, uniqueItems: true }),
  sourceIds: Type.Array(Id, { minItems: 1, uniqueItems: true }),
  explanation: Type.String({ minLength: 1 }),
  review: ReviewMetaSchema,
};

export const ChoiceQuizSchema = Type.Object({
  ...CommonQuizFields,
  type: Type.Literal("choice"),
  options: Type.Array(OptionSchema, { minItems: 2, maxItems: 6 }),
  correctOptionId: Id,
  feedbackByOption: Type.Optional(Type.Record(Id, Type.String({ minLength: 1 }))),
});

export const ComparisonQuizSchema = Type.Object({
  ...CommonQuizFields,
  type: Type.Literal("comparison"),
  levelRank: Type.String({ pattern: "^(?:[2-9]|10|[JQKA])$" }),
  groups: Type.Array(
    Type.Object({ id: Id, label: Type.String({ minLength: 1 }), cards: Type.Array(CardCode, { minItems: 1, maxItems: 10 }) }),
    { minItems: 2, maxItems: 4 },
  ),
  correctGroupId: Id,
});

export const DecisionQuizSchema = Type.Object({
  ...CommonQuizFields,
  type: Type.Literal("decision"),
  situation: Type.Object({
    levelRank: Type.String({ pattern: "^(?:[2-9]|10|[JQKA])$" }),
    yourHand: Type.Array(CardCode, { minItems: 1, maxItems: 27 }),
    previousPlay: Type.Optional(Type.Array(CardCode, { maxItems: 10 })),
    notes: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  }),
  options: Type.Array(
    Type.Object({
      id: Id,
      label: Type.String({ minLength: 1 }),
      cards: Type.Optional(Type.Array(CardCode, { maxItems: 10 })),
      feedback: Type.String({ minLength: 1 }),
    }),
    { minItems: 2, maxItems: 6 },
  ),
  recommendedOptionId: Id,
  conditions: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
});

export const QuizSchema = Type.Union([ChoiceQuizSchema, ComparisonQuizSchema, DecisionQuizSchema], { $id: "Quiz" });
export const TrackListSchema = Type.Array(TrackSchema);
export const SkillListSchema = Type.Array(SkillSchema);
export const SourceListSchema = Type.Array(SourceSchema);

export type ReviewMeta = Static<typeof ReviewMetaSchema>;
export type Source = Static<typeof SourceSchema>;
export type Skill = Static<typeof SkillSchema>;
export type Track = Static<typeof TrackSchema>;
export type LessonFrontmatter = Static<typeof LessonFrontmatterSchema>;
export type CardBlock = Static<typeof CardBlockSchema>;
export type ChoiceQuiz = Static<typeof ChoiceQuizSchema>;
export type ComparisonQuiz = Static<typeof ComparisonQuizSchema>;
export type DecisionQuiz = Static<typeof DecisionQuizSchema>;
export type Quiz = Static<typeof QuizSchema>;
export type TrackId = Static<typeof TrackId>;
export type CardCode = Static<typeof CardCode>;

export interface Lesson extends LessonFrontmatter {
  body: string;
  cards: CardBlock[];
}

export interface ContentIndex {
  tracks: Track[];
  skills: Skill[];
  sources: Source[];
  lessons: Lesson[];
  quizzes: Quiz[];
  trackById: Map<string, Track>;
  skillById: Map<string, Skill>;
  sourceById: Map<string, Source>;
  lessonById: Map<string, Lesson>;
  quizById: Map<string, Quiz>;
}
