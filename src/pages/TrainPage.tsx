import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { content, getQuizzes } from "../content";

export function TrainPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [trackId, setTrackId] = useState(params.get("trackId") ?? "");
  const [skillId, setSkillId] = useState(params.get("skillId") ?? "");
  const [difficulty, setDifficulty] = useState(params.get("difficulty") ?? "");
  const count = getQuizzes({ trackId: trackId || undefined, skillId: skillId || undefined, difficulty: difficulty ? Number(difficulty) : undefined }).length;
  const start = () => { const query = new URLSearchParams(); if (trackId) query.set("trackId", trackId); if (skillId) query.set("skillId", skillId); if (difficulty) query.set("difficulty", difficulty); navigate(`/train/session?${query}`); };
  return <div className="page"><header className="page-header"><span className="eyebrow">训练场</span><h1>一次只练一个明确问题</h1><p>每组最多 10 题，不重复。提交后立即看到推荐答案、理由和相关知识。</p></header><section className="filter-panel"><div className="filter-title"><SlidersHorizontal aria-hidden="true" /><div><h2>选择训练范围</h2><p>当前有 {count} 道匹配题</p></div></div><div className="filter-grid"><label>学习路径<select value={trackId} onChange={(event) => setTrackId(event.target.value)}><option value="">全部路径</option>{content.tracks.map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}</select></label><label>知识标签<select value={skillId} onChange={(event) => setSkillId(event.target.value)}><option value="">全部标签</option>{content.skills.filter((skill) => skill.availability === "available").map((skill) => <option key={skill.id} value={skill.id}>{skill.title}</option>)}</select></label><label>难度<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">全部难度</option><option value="1">难度 1</option><option value="2">难度 2</option><option value="3">难度 3</option></select></label></div><button type="button" className="button primary" disabled={!count} onClick={start}>开始训练 <ArrowRight aria-hidden="true" /></button></section><section className="question-type-band"><div><span>01</span><strong>选择判断</strong><p>检查规则和决策原则。</p></div><div><span>02</span><strong>牌型比较</strong><p>先判断可比性，再判断大小。</p></div><div><span>03</span><strong>局面决策</strong><p>结合条件比较行动收益。</p></div></section></div>;
}
