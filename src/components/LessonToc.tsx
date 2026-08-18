import { useEffect, useState } from "react";
import type { LessonSection } from "../features/lessons/navigation";

interface LessonTocProps {
  sections: LessonSection[];
  onNavigate?: () => void;
}

export function LessonToc({ sections, onNavigate }: LessonTocProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "");
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const elements = sections.map((section) => document.getElementById(section.id)).filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveId(visible[0].target.id);
    }, { rootMargin: "-104px 0px -58% 0px", threshold: [0, 1] });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  if (!sections.length) return null;
  const navigate = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };
  return <nav className="lesson-section-nav" aria-label="章节导航">
    <div className="lesson-section-nav-heading"><span className="eyebrow">本页章节</span><strong>阅读导航</strong></div>
    <ol>
      {sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className={activeId === section.id ? "active" : undefined} aria-current={activeId === section.id ? "location" : undefined} onClick={(event) => { event.preventDefault(); navigate(section.id); }}>{section.title}</a></li>)}
    </ol>
  </nav>;
}
