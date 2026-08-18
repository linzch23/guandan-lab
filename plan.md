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

进度使用 `ProgressV1`：已完成课程、逐题统计、两条路径结业记录和最近位置，并带可选 `contentRevision: 2`。内容修订迁移只清空旧结业成绩，不删除旧课程完成、题目记录和位置；新题 ID 使旧记录自然排除在新统计之外。

## 模块设计

- 内容系统：`loadContent`、`getLesson`、`getQuiz`、`getQuizzes`、`validateContent`。
- 学习模块：`getNextLesson`、`canCompleteLesson`、`completeLesson`。
- 训练模块：`createSession`、`gradeAnswer`、`scoreAssessment`。
- 进度模块：`loadProgress`、`recordAnswer`、`recordAssessment`、`deriveSkillStats`、`deriveTrackStatus`、`resetProgress`。
- 展示组件：应用外壳、牌面、三类题目、反馈与进度。

## 内容目录

零基础：B01 快速认识掼蛋；B02 牌型与大小；B03 一轮怎么打；B04 一局与升级。基础课正文目标 800–1,200 字。

技巧：S01 起手评估、理牌与组牌；S02 出牌顺序、牌权与节奏；S03 记牌、过牌与手型推断；S04 对家配合与位置策略；S05 炸弹、逢人配、进贡还贡与风险；S06 残局、比赛策略与复盘训练。进阶课正文目标 1,200–1,800 字。

题库为基础 12 题、进阶 24 题，共 14 道选择/判断、10 道比较、12 道决策。两套测验各固定引用 10 道新题。

## 文件组织

应用位于仓库根目录。`content/` 存放目录、课程、题目和公开 Schema；`src/` 存放应用、组件、内容装载与功能；`scripts/` 存放 Schema 生成和内容校验；`tests/e2e/` 存放端到端测试。

## 技术决策

React、TypeScript、Vite、Tailwind、React Router HashRouter、TypeBox、React Context + reducer、版本化 localStorage、自有 HTML/CSS 牌面、Lucide 图标、npm lockfile 和单一 Pages workflow。无 UI 大框架、全局状态框架、MDX、规则引擎或空的未来目录。

## 测试策略

覆盖 Schema 与内容校验、训练和进度纯逻辑、组件键盘交互、五个端到端用户场景，以及 390x844 和 1440x900 的视觉检查。软件测试与人工内容审核是两个独立门禁。

## 2026-08-18 答题体验优化技术设计

### 架构概览

课程页在课程标识变化后同步重置文档滚动位置。答题展示拆为“受控题目区”和“只读反馈区”，普通训练与结业测验由会话工作台统一编排；课程内即时练习继续使用现有紧凑包装。

### 核心数据结构

- `SessionQuestionState` 包含当前会话中该题的 `selectedOptionId` 和提交后的 `result`。
- `SessionState = Record<quizId, SessionQuestionState>`，只在当前会话内保存，不新增本地存储键。
- `SessionRunner` 维持现有 `quizzes`、`onAnswer`、`onFinish` 对外接口。

### 模块设计

- 课程导航：课程标识变化时立即执行无动画滚动归零。
- 答题组件：分离受控题目区和只读反馈区；紧凑课程练习继续由包装组件管理本地状态。
- 会话工作台：统一管理当前题、每题选择和结果；首次提交才调用 `onAnswer`。
- 题目导航：允许直接切到任意题，显示未作答、待提交、正确和待复习状态，并标记当前题。
- 完成规则：首尾导航正确禁用，最后一题仅在全部题目提交后提供结果入口。
- 滚动规则：桌面题目区和反馈区独立滚动，切换题目时各自回到顶部。
- 响应式：大于 860px 使用三栏；860px 及以下改为顶部题号条、单列正文与反馈、位于全局移动导航上方的固定操作栏。

### 文件组织

- `src/pages/LessonPage.tsx`：课程切换滚动归零。
- `src/components/QuizView.tsx`：受控题目区、反馈区及课程紧凑包装。
- `src/components/SessionRunner.tsx`：会话状态、题目列表、三栏布局语义和稳定导航。
- 训练页、测验页和全局样式负责工作台页面布局与响应式表现。
- 组件测试和端到端测试覆盖状态保持、滚动归零及响应式行为。

### 技术决策

| 决策点 | 选择 | 理由 |
| --- | --- | --- |
| 状态归属 | 会话层按题保存 | 支持自由切题和状态保持，且无需持久化新数据 |
| 反馈布局 | 独立只读区域 | 解析长度不再推动导航按钮 |
| 完成时机 | 全题提交后 | 防止自由跳题造成漏答完成 |
| 断点 | 沿用 860px | 与现有桌面/移动主导航切换一致 |
| 课程滚动 | 课程标识变化后立即归零 | 行为确定，兼容减少动态效果设置 |

## 2026-08-18 课程阅读布局技术设计

- `LessonDirectory` 根据 `content.tracks`、`lessonIds` 和当前进度渲染全量课程目录；桌面端 sticky 且独立滚动，移动端复用到抽屉。
- `deriveLessonSections` 从课程正文提取 `##` 标题，生成带序号的稳定 HTML ID；`LessonToc` 使用 `IntersectionObserver` 同步当前章节并处理平滑跳转。
- `LessonPage` 为 Markdown `h2` 注入章节 ID，桌面端使用目录/正文/章节三栏，移动端使用顶部工具按钮和遮罩抽屉。
- 不改内容 Schema、题目、评分或进度；侧栏展开状态只存在当前页面会话。
