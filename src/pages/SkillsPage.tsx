import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { content } from "../content";

export function SkillsPage() {
  const available = content.skills.filter((skill) => skill.availability === "available");
  const roadmap = content.skills.filter((skill) => skill.availability === "roadmap");
  return <div className="page"><header className="page-header"><span className="eyebrow">知识地图</span><h1>每个知识点都连接到练习</h1><p>先建立规则底座，再训练可以反复解释的决策方法。</p></header><section className="knowledge-map">{available.map((skill, index) => { const lesson = content.lessons.find((item) => item.skillIds.includes(skill.id)); const questionCount = content.quizzes.filter((quiz) => quiz.skillIds.includes(skill.id)).length; return <article className="knowledge-node" key={skill.id}><span className="node-order">{String(index + 1).padStart(2, "0")}</span><div><small>{skill.group === "rules" ? "规则基础" : "实战技巧"}</small><h2>{skill.title}</h2><p>{skill.description}</p><div className="node-links">{lesson && <Link to={`/learn/${lesson.id}`}>学习课程 <ArrowRight aria-hidden="true" /></Link>}<Link to={`/train?skillId=${skill.id}`}>{questionCount} 道训练</Link></div></div></article>; })}</section><section className="roadmap-band"><div><span className="eyebrow">ROADMAP</span><h2>以后再做，不伪装成已上线</h2></div>{roadmap.map((skill) => <div className="roadmap-item" key={skill.id}><LockKeyhole aria-hidden="true" /><span><strong>{skill.title}</strong><small>{skill.description}</small></span></div>)}</section></div>;
}
