# Content review gate

The following items are intentionally `draft`. A maintainer must review each item against the latest effective national competitive rules and the criteria below before changing its metadata to `approved`.

For every item verify: factual accuracy, exact terminology, source relevance, strategy conditions, answer and option feedback, card example legality, and original wording.

## Lessons

- [ ] b01-introduction
- [ ] b02-deck-level-card
- [ ] b03-basic-combinations
- [ ] b04-bombs-special
- [ ] b05-ranking
- [ ] b06-turn-flow
- [ ] b07-tribute
- [ ] b08-round-and-leveling
- [ ] s01-hand-organization
- [ ] s02-play-order
- [ ] s03-control-and-pass
- [ ] s04-bombs-and-wildcards
- [ ] s05-card-memory
- [ ] s06-partner-coordination

## Beginner questions

- [ ] b01-goal
- [ ] b02-level-card
- [ ] b02-wildcard-compare
- [ ] b03-type
- [ ] b03-pair-compare
- [ ] b03-straight-compare
- [ ] b04-bomb-rule
- [ ] b04-bomb-count-compare
- [ ] b04-straight-flush-compare
- [ ] b05-ranking-one
- [ ] b05-ranking-two
- [ ] b05-ranking-three
- [ ] b06-follow
- [ ] b06-follow-compare
- [ ] b07-tribute
- [ ] b07-resist
- [ ] b08-leveling
- [ ] b08-round-compare

## Skill questions

- [ ] s01-principle
- [ ] s01-decision-one
- [ ] s01-decision-two
- [ ] s02-principle
- [ ] s02-decision-one
- [ ] s02-decision-two
- [ ] s03-principle
- [ ] s03-decision-one
- [ ] s03-decision-two
- [ ] s04-principle
- [ ] s04-decision-one
- [ ] s04-decision-two
- [ ] s05-principle
- [ ] s05-decision-one
- [ ] s05-decision-two
- [ ] s06-principle
- [ ] s06-decision-one
- [ ] s06-decision-two

## Approval procedure

1. Complete every checkbox and record corrections in the pull request or review notes.
2. Set each item's `review.status` to `approved` and add the real reviewer name and ISO date.
3. Run `npm run validate:content -- --mode=production`.
4. Do not deploy if the command reports any remaining draft or reference error.
