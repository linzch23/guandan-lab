import { BookOpen, ChartNoAxesColumn, CircleHelp, FlaskConical, GraduationCap, House, Network } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { content } from "../content";

const navItems = [
  { to: "/", label: "首页", icon: House, end: true },
  { to: "/learn", label: "学习", icon: BookOpen },
  { to: "/train", label: "训练", icon: GraduationCap },
  { to: "/skills", label: "知识", icon: Network },
  { to: "/progress", label: "进度", icon: ChartNoAxesColumn },
  { to: "/about", label: "关于", icon: CircleHelp },
];

export function AppShell({ children }: { children: ReactNode }) {
  const hasDrafts = [...content.lessons, ...content.quizzes].some((item) => item.review.status === "draft");
  return <div className="app-shell">
    <a href="#main" className="skip-link">跳到主要内容</a>
    <header className="topbar">
      <NavLink to="/" className="brand" aria-label="GuandanLab 首页"><span className="brand-mark"><FlaskConical aria-hidden="true" /></span><span><strong>GuandanLab</strong><small>掼蛋实验室</small></span></NavLink>
      <nav className="desktop-nav" aria-label="主导航">{navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "active" : ""}><Icon aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
    </header>
    {hasDrafts && <div className="draft-banner" role="note">内容预览版：规则与策略仍等待维护者逐条审核，不能作为赛事裁定依据。</div>}
    <main id="main" className="main-content">{children}</main>
    <footer className="site-footer"><span>GuandanLab · Learn. Train. Master.</span><span>代码 MIT · 内容 CC BY-SA 4.0</span></footer>
    <nav className="mobile-nav" aria-label="移动端主导航">{navItems.slice(0, 5).map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "active" : ""}><Icon aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
  </div>;
}
