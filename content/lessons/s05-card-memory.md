---
schemaVersion: 1
id: s05-card-memory
trackId: skills
title: 基础记牌与剩余牌推断
summary: 不追求一次记住 108 张，先记录会改变下一次决策的关键牌。
order: 5
durationMinutes: 9
objectives: [建立关键牌记忆优先级, 用已出现牌缩小剩余范围]
skillIds: [card-memory]
checkpointQuestionIds: [s05-principle, s05-decision-one, s05-decision-two]
sourceIds: [national-rules]
review: { status: draft }
---

## 从三类信息开始

新手先记大小王、当前级牌和已经暴露的炸弹线索。然后根据自己的收尾牌型，追加记录能压住它的关键高牌。例如你准备最后走一对 K，就优先关注两副牌中的 A、级牌和王是否已经出现。

```cards
{"title":"打 6 时优先关注的高牌","levelRank":"6","groups":[{"label":"已看到离场","cards":["RJ","S-6","D-6","S-A","H-A"]},{"label":"自己的收尾对 K","cards":["S-K","D-K"]}]}
```

正确示例：每轮结束快速更新“王剩几张、级牌大致剩几张、我关心的牌型还有哪些更大组合”。错误示例：试图按顺序复述所有小牌，结果在关键时刻忘了王和级牌。

适用条件：公开信息只能缩小范围，不能证明某张未出现的牌一定在某个玩家手中。推断应使用“更可能”，不要当成确定事实。

## 本节总结

记牌服务于决策。先记影响最大、数量最少、与你的收尾最相关的牌。
