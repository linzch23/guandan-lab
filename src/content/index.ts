import tracksData from "../../content/catalog/tracks.json";
import skillsData from "../../content/catalog/skills.json";
import sourcesData from "../../content/catalog/sources.json";
import { parseLesson } from "./parse";
import {
  type ContentIndex,
  type Quiz,
  type Skill,
  type Source,
  type Track,
} from "./schema";

const lessonModules = import.meta.glob("../../content/lessons/*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
const quizModules = import.meta.glob("../../content/quizzes/*.json", { eager: true, import: "default" }) as Record<string, unknown>;

export function loadContent(): ContentIndex {
  const tracks = tracksData as Track[];
  const skills = skillsData as Skill[];
  const sources = sourcesData as Source[];
  const lessons = Object.values(lessonModules).map(parseLesson).sort((a, b) => a.order - b.order);
  const quizzes = Object.values(quizModules) as Quiz[];
  return {
    tracks,
    skills,
    sources,
    lessons,
    quizzes,
    trackById: new Map(tracks.map((item) => [item.id, item])),
    skillById: new Map(skills.map((item) => [item.id, item])),
    sourceById: new Map(sources.map((item) => [item.id, item])),
    lessonById: new Map(lessons.map((item) => [item.id, item])),
    quizById: new Map(quizzes.map((item) => [item.id, item])),
  };
}

export const content = loadContent();
export const getLesson = (id: string) => content.lessonById.get(id);
export const getQuiz = (id: string) => content.quizById.get(id);
export const getTrack = (id: string) => content.trackById.get(id);
export const getSkill = (id: string) => content.skillById.get(id);
export const getQuizzes = (filters: { trackId?: string; skillId?: string; difficulty?: number }) => content.quizzes.filter((quiz) => (!filters.trackId || quiz.trackId === filters.trackId) && (!filters.skillId || quiz.skillIds.includes(filters.skillId)) && (!filters.difficulty || quiz.difficulty === filters.difficulty));
