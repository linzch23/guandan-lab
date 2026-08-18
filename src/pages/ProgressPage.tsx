import { CheckCircle2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { content } from "../content";
import { ProgressBar } from "../components/ProgressBar";
import { deriveSkillStats, deriveTrackStatus, useProgress } from "../features/progress/progress";

export function ProgressPage() {
  const { progress, resetProgress } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const stats = deriveSkillStats(content, progress);
  return <div className="page"><header className="page-header"><span className="eyebrow">学习进度</span><h1>只记录你实际完成的内容</h1><p>统计保存在当前浏览器。少于 3 道不同题时不显示技巧百分比。</p></header><section className="progress-tracks">{content.tracks.map((track) => { const status = deriveTrackStatus(content, progress, track.id); return <article key={track.id}><div className="status-heading"><div><small>{status.completed ? "路径已完成" : "学习中"}</small><h2>{track.title}</h2></div>{status.completed && <CheckCircle2 aria-label="已完成" />}</div><ProgressBar value={status.completedLessons} max={status.totalLessons} label="课程" /><p>结业测验：{status.assessmentPassed ? `已通过 · 最佳 ${progress.assessments[track.id]?.bestScore}%` : "尚未通过"}</p></article>; })}</section><section className="skill-stats"><div className="section-heading"><div><span className="eyebrow">技巧表现</span><h2>按最近一次作答计算</h2></div></div>{stats.map(({ skill, attempted, correct, percent }) => <div className="skill-stat" key={skill.id}><div><strong>{skill.title}</strong><small>{attempted ? `${correct}/${attempted} 道最近判断推荐` : "还没有作答记录"}</small></div>{percent === null ? <span className="pending">待积累</span> : <div className="skill-meter"><span style={{ width: `${percent}%` }} /><strong>{percent}%</strong></div>}</div>)}</section><section className="reset-zone"><div><h2>清空本地进度</h2><p>这只影响当前浏览器，且无法恢复。</p></div>{!confirming ? <button className="button danger" type="button" onClick={() => setConfirming(true)}><RotateCcw aria-hidden="true" />清空进度</button> : <div className="confirm-actions" role="alert"><span>确定清空？</span><button type="button" className="button danger" onClick={() => { resetProgress(); setConfirming(false); }}>确定</button><button type="button" className="button ghost" onClick={() => setConfirming(false)}>取消</button></div>}</section></div>;
}
