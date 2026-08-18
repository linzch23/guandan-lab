import { Link } from "react-router-dom";

export function NotFoundPage() { return <div className="page empty-state"><span className="result-number">404</span><h1>这里没有这张牌</h1><p>链接可能已经变化，回到学习首页继续。</p><Link className="button primary" to="/">返回首页</Link></div>; }
