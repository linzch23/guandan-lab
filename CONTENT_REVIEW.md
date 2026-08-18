# Content review gate

The following items are intentionally `draft`. A maintainer must review each item against the latest effective national competitive rules and the criteria below before changing its metadata to `approved`.

For every item verify: factual accuracy, exact terminology, source relevance, strategy conditions, answer and option feedback, card example legality, and original wording.

## Lessons

- [ ] b01-introduction
- [ ] b02-deck-level-card
- [ ] b03-basic-combinations
- [ ] b04-bombs-special
- [ ] s01-hand-organization
- [ ] s02-play-order
- [ ] s03-control-and-pass
- [ ] s04-bombs-and-wildcards
- [ ] s05-card-memory
- [ ] s06-partner-coordination

## Beginner questions

- [ ] b01-quick-goal
- [ ] b01-quick-level
- [ ] b01-quick-type-compare
- [ ] b02-basic-type
- [ ] b02-pair-compare
- [ ] b02-straight-compare
- [ ] b03-turn-choice
- [ ] b03-tribute-decision
- [ ] b03-round-compare
- [ ] b04-bomb-choice
- [ ] b04-leveling
- [ ] b04-common-errors

## Skill questions

- [ ] s01-scan-choice
- [ ] s01-structure-compare
- [ ] s01-role-decision
- [ ] s01-wildcard-decision
- [ ] s02-order-choice
- [ ] s02-pass-choice
- [ ] s02-control-compare
- [ ] s02-return-decision
- [ ] s03-memory-choice
- [ ] s03-pass-compare
- [ ] s03-inference-decision
- [ ] s03-count-decision
- [ ] s04-partner-choice
- [ ] s04-position-compare
- [ ] s04-send-decision
- [ ] s04-block-decision
- [ ] s05-bomb-choice
- [ ] s05-wildcard-choice
- [ ] s05-tribute-compare
- [ ] s05-risk-decision
- [ ] s06-endgame-choice
- [ ] s06-format-compare
- [ ] s06-endgame-decision
- [ ] s06-review-decision

## Approval procedure

1. Complete every checkbox and record corrections in the pull request or review notes.
2. Set each item's `review.status` to `approved` and add the real reviewer name and ISO date.
3. Run `npm run validate:content -- --mode=production`.
4. Do not deploy if the command reports any remaining draft or reference error.
