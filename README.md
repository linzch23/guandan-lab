# GuandanLab / 掼蛋实验室

面向掼蛋新手的开源交互式学习与训练平台。

GuandanLab 不把规则堆成文章列表，而是用“短课 → 牌例 → 即时练习 → 解释 → 进度”形成学习闭环。首版包含 4 节零基础课程、6 节技巧课程与 36 道训练题，完全在浏览器中运行。

> 当前内容状态：技术预览。全部课程和题目仍为 `draft`，等待维护者依据最新有效的国家竞技规则逐条审核。不要将草稿内容作为赛事裁定依据。

## 功能

- 零基础入门与常用技巧提升两条路径
- Markdown 课程与独立 JSON 题目
- 选择判断、牌型比较、局面决策三类训练
- 固定覆盖的 10 题结业测验
- 知识地图和按标签派生的技巧表现
- `localStorage` 本地进度，无账号、无追踪
- 构建期 Schema、引用、审核状态和数量校验
- GitHub Pages 项目子路径部署

## 本地运行

要求 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

Vite 使用 `/guandan-lab/` 作为项目基路径。打开终端显示的地址，并保留该子路径。

## 验证

```bash
npm run schema:check
npm run validate:content -- --mode=development
npm run lint
npm run typecheck
npm run test -- --run
npm run build
npm run test:e2e
```

正式发布还必须运行：

```bash
npm run validate:content -- --mode=production
```

该命令要求恰有 10 节课程和 36 道题，基础/进阶为 4/6，题型分布为 14/10/12，并拒绝任何缺少审核人和审核日期的草稿内容。

## 内容结构

```text
content/
├── catalog/     # 路径、技能和来源
├── lessons/     # Markdown 课程
├── quizzes/     # 每题一个 JSON 文件
└── schemas/     # 提交到仓库的 JSON Schema
```

实现架构与需求基线分别见 [spec.md](spec.md)、[plan.md](plan.md)、[task.md](task.md) 和 [checklist.md](checklist.md)。贡献内容前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## GitHub Pages

仓库内工作流会在主分支依次运行 Schema 同步、内容校验、lint、类型检查、测试、构建与端到端测试，全部通过后上传 Pages 产物。

当前工作流发布的是技术预览版，因此内容校验使用 development 模式。课程和题目仍然是 `draft`，页面会显示预览提示，不应将其中的规则与策略作为赛事裁定依据。

待全部课程和题目完成审核后，将 `.github/workflows/deploy-pages.yml` 中的校验切换为 `--mode=production`，并先在本地运行 `npm run validate:content -- --mode=production`，通过后再提交发布。

首次发布由仓库所有者完成：

1. 创建名为 `guandan-lab` 的公开仓库并推送代码。
2. 在仓库 Settings → Pages 中将 Source 设置为 GitHub Actions。
3. 等待 `Deploy GitHub Pages` 工作流完成。
4. 打开 `https://<用户名>.github.io/guandan-lab/` 并验证 Hash 深链。

若仓库名不是 `guandan-lab`，同步修改 `vite.config.ts` 中的 `base`。

## 许可

- 程序代码：MIT License，见 [LICENSE](LICENSE)。
- `content/` 中的原创教程与题库：CC BY-SA 4.0，见 [LICENSE-CONTENT](LICENSE-CONTENT)。
- 规则文件版权归原发布机构所有；本项目只引用名称、来源并撰写原创讲解。
