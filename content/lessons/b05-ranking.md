---
schemaVersion: 1
id: b05-ranking
trackId: beginner
title: 牌型大小与比较
summary: 先判断能否比较，再在同类型中找决定大小的关键点数。
order: 5
durationMinutes: 10
objectives: [判断两手牌是否可直接比较, 找到同牌型的比较依据]
skillIds: [ranking, deck-level]
checkpointQuestionIds: [b05-ranking-one, b05-ranking-two, b05-ranking-three]
sourceIds: [national-rules]
review: { status: draft }
---

## 比大小前先过三道门

1. 两手是不是同一类型？
2. 规则是否要求相同张数或相同结构？
3. 当前级牌是什么？

普通对子不能直接去接三张，普通顺子也不能直接接三带二。只有可比较时，才继续看决定牌型大小的点数。炸弹是跨类型压制的例外，但炸弹内部另有等级。

```cards
{"title":"同类型才能直接比较","levelRank":"6","groups":[{"label":"对 10","cards":["S-10","H-10"]},{"label":"对 K","cards":["S-K","D-K"]},{"label":"三张 8","cards":["S-8","H-8","D-8"]}]}
```

打 6 时，级牌 6 的位置不同于普通数字 6。看到含级牌或逢人配的牌型，要先明确它的实际结构，再判断大小。

## 一个可靠的口头流程

“这是对子，对方也是对子；都没有特殊替代；比较点数，K 大于 10。”把判断说完整，比只背结论更不容易出错。

## 本节总结

牌型比较的第一步是确认可比性，不是急着找最大的那张牌。
