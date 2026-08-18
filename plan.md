# GuandanLab MVP Plan

## 架构概览

单一浏览器应用分为内容、内容装载与校验、产品功能、展示四层。静态构建由 GitHub Actions 发布到 GitHub Pages，不使用运行时 API、数据库或服务端渲染。

## 页面信息架构

- `#/` 学习首页
- `#/learn` 双路径课程列表
- `#/learn/:lessonId` 课程、牌例、检查题与导航
- `#/skills` 知识地图
- `#/train` 训练筛选
- `#/train/session` 训练会话
- `#/assessment/:trackId` 结业测验
- `#/progress` 学习进度
- `#/about` 规则、许可与贡献说明

## 核心数据结构

内容包含 `Track`、`Skill`、`Source`、`LessonFrontmatter`、`ChoiceQuiz`、`ComparisonQuiz`、`DecisionQuiz`、`ReviewMeta` 和 `CardCode`。课程使用 Markdown，题目使用版本化 JSON，TypeBox 是类型和 JSON Schema 的单一来源。

进度使用 `ProgressV1`：已完成课程、逐题统计、两条路径结业记录和最近位置。技巧统计由每道题最近一次结果派生。同一道题不会因重复作答重复增加样本权重。

## 模块设计

- 内容系统：`loadContent`、`getLesson`、`getQuiz`、`getQuizzes`、`validateContent`。
- 学习模块：`getNextLesson`、`canCompleteLesson`、`completeLesson`。
- 训练模块：`createSession`、`gradeAnswer`、`scoreAssessment`。
- 进度模块：`loadProgress`、`recordAnswer`、`recordAssessment`、`deriveSkillStats`、`deriveTrackStatus`、`resetProgress`。
- 展示组件：应用外壳、牌面、三类题目、反馈与进度。

## 内容目录

零基础：B01 认识掼蛋与胜负目标；B02 两副牌、座次、级牌与逢人配；B03 基础牌型；B04 炸弹与特殊牌型；B05 牌型大小与比较；B06 出牌、接牌、过牌与一轮流程；B07 进贡、还贡与抗贡；B08 名次、升级、完整牌局流程与常见错误。

技巧：S01 理牌与组牌；S02 出牌顺序；S03 牌权控制与过牌；S04 炸弹与逢人配的使用；S05 基础记牌与剩余牌推断；S06 对家配合。

题库为 14 道选择/判断、10 道比较、12 道决策。两套测验各固定引用 10 道现有题目。

## 文件组织

应用位于仓库根目录。`content/` 存放目录、课程、题目和公开 Schema；`src/` 存放应用、组件、内容装载与功能；`scripts/` 存放 Schema 生成和内容校验；`tests/e2e/` 存放端到端测试。

## 技术决策

React、TypeScript、Vite、Tailwind、React Router HashRouter、TypeBox、React Context + reducer、版本化 localStorage、自有 HTML/CSS 牌面、Lucide 图标、npm lockfile 和单一 Pages workflow。无 UI 大框架、全局状态框架、MDX、规则引擎或空的未来目录。

## 测试策略

覆盖 Schema 与内容校验、训练和进度纯逻辑、组件键盘交互、五个端到端用户场景，以及 390x844 和 1440x900 的视觉检查。软件测试与人工内容审核是两个独立门禁。
