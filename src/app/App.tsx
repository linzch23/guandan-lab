import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "./AppShell";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const LearnPage = lazy(() => import("../pages/LearnPage").then((module) => ({ default: module.LearnPage })));
const LessonPage = lazy(() => import("../pages/LessonPage").then((module) => ({ default: module.LessonPage })));
const SkillsPage = lazy(() => import("../pages/SkillsPage").then((module) => ({ default: module.SkillsPage })));
const TrainPage = lazy(() => import("../pages/TrainPage").then((module) => ({ default: module.TrainPage })));
const TrainingSessionPage = lazy(() => import("../pages/TrainingSessionPage").then((module) => ({ default: module.TrainingSessionPage })));
const AssessmentPage = lazy(() => import("../pages/AssessmentPage").then((module) => ({ default: module.AssessmentPage })));
const ProgressPage = lazy(() => import("../pages/ProgressPage").then((module) => ({ default: module.ProgressPage })));
const AboutPage = lazy(() => import("../pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

export function App() {
  return <AppShell><Suspense fallback={<div className="page loading-state">正在整理牌桌…</div>}><Routes><Route path="/" element={<HomePage />} /><Route path="/learn" element={<LearnPage />} /><Route path="/learn/:lessonId" element={<LessonPage />} /><Route path="/skills" element={<SkillsPage />} /><Route path="/train" element={<TrainPage />} /><Route path="/train/session" element={<TrainingSessionPage />} /><Route path="/assessment/:trackId" element={<AssessmentPage />} /><Route path="/progress" element={<ProgressPage />} /><Route path="/about" element={<AboutPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></Suspense></AppShell>;
}
