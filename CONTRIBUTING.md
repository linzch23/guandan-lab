# 为 GuandanLab 贡献内容

感谢你帮助新手更准确地学习掼蛋。首版统一使用国家竞技规则口径；地方玩法可以在说明中提示，但不能改变正式答案。

## 开始之前

1. 安装依赖并运行 `npm run schema:check`。
2. 复制相邻课程或题目作为模板，不要修改页面代码来接入内容。
3. 使用小写短横线 ID，且在整个项目中保持唯一。
4. 新内容一律以 `review.status: draft` 提交。

## 贡献一节课程

在 `content/lessons/` 新增 Markdown。frontmatter 必须符合 `content/schemas/lesson.schema.json`，正文至少包含学习目标对应的讲解、一个正例或反例、总结和一个合法 `cards` JSON 代码块。

课程通过 `checkpointQuestionIds` 引用独立题目。不要在 Markdown 中嵌入 JSX、脚本或 React 组件。

## 贡献一道题

在 `content/quizzes/` 新增一个 JSON 文件，并让文件名与题目 ID 一致。题目必须符合 `content/schemas/quiz.schema.json`。

- 规则题需要可追溯来源。
- 比较题必须标明当前级牌。
- 决策题必须填写 `conditions` 和每个选项的反馈。
- 不确定的策略使用“当前条件下推荐”，不要写成无条件唯一解。

## 牌码

- 四种花色：`S-9`、`H-A`、`C-10`、`D-K`
- 小王：`BJ`
- 大王：`RJ`
- 两副牌允许牌码重复。

## 本地检查

```bash
npm run schema:generate
npm run validate:content -- --mode=development
npm run lint
npm run typecheck
npm run test -- --run
npm run build
```

正式发布校验由维护者在审核完成后执行。贡献者不得自行填写维护者姓名或伪造审核日期。

## 审核标准

- 规则事实与采用的规则版本一致。
- 问题有明确可观察答案，解析能解释原因。
- 策略注明成立条件、风险与反例。
- 内容使用原创表达，引用和素材许可清楚。
- 课程与题目 ID、标签、来源和关联课程全部有效。
