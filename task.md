# GuandanLab MVP Tasks

## 执行任务

- [x] T1-T8：工具链、设计基础、内容 Schema、Schema 输出、内容校验、内容索引、训练内核、进度内核。
- [x] T9-T17：路由导航、牌面、三类答题组件、首页、路径页、课程页、训练页、知识/进度页、结业测验、关于页。
- [x] T18-T25：按顺序完成 B01-B08 及配套 18 道规则题（草稿）。
- [x] T26-T31：按顺序完成 S01-S06 及配套 18 道技巧题（草稿）。
- [x] T32：固定课程目录、知识关联与两套结业测验。
- [x] T33-T35：集成测试、端到端测试、开源文档。
- [ ] T36：输出逐课逐题审核清单；用户批准后才能标记为 `approved`。
- [x] T37：Pages 工作流配置完成。
- [ ] T38：软件与视觉验证已完成；等待 T36 后执行正式内容校验并完成最终验收。

## 验证命令

- `npm run schema:check`
- `npm run validate:content -- --mode=production`
- `npm run lint`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run test:e2e`

## 执行顺序

`T1 -> T2-T8 -> T9-T17 -> T18-T32 -> T33-T35 -> T36 -> T37 -> T38`

T36 是人工门禁。未获用户内容批准不得伪造审核状态或宣称正式发布就绪。
