import { ExternalLink, Github, Scale } from "lucide-react";
import { content } from "../content";

export function AboutPage() {
  const source = content.sources[0];
  return <div className="page"><header className="page-header"><span className="eyebrow">关于项目</span><h1>开放内容，也公开边界</h1><p>GuandanLab 希望把规则与经验转成可检查、可讨论、可训练的内容。</p></header><section className="about-grid"><article><Scale aria-hidden="true" /><h2>规则口径</h2><p>首版以《竞技掼蛋扑克竞赛规则（试行）》为统一基准，不支持地方规则切换。具体赛事可能有补充规定，参赛前应再次核对。</p><a href={source.url} target="_blank" rel="noreferrer">{source.publisher}<ExternalLink aria-hidden="true" /></a></article><article><Github aria-hidden="true" /><h2>开源许可</h2><p>程序代码采用 MIT License。原创教程与题库采用 CC BY-SA 4.0。牌面由 HTML/CSS 和文字花色生成，不使用第三方牌图。</p><a href="https://github.com/" target="_blank" rel="noreferrer">GitHub 仓库待首次发布后补充<ExternalLink aria-hidden="true" /></a></article></section><section className="contribution-band"><div><span className="eyebrow">社区贡献</span><h2>一道题也值得认真提交</h2><p>复制内容模板，填写来源、答案、解析、标签和审核状态，再运行内容校验。草稿可以预览，但不能进入正式发布。</p></div><div className="contribution-steps"><span>01 阅读 CONTRIBUTING.md</span><span>02 新增 Markdown 或 JSON</span><span>03 运行内容校验</span><span>04 提交审核</span></div></section></div>;
}
