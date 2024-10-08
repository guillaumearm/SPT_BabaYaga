# Trap's Baba Yaga

This repo is a mod for [sp-tarkov](https://sp-tarkov.com/)

## Description
Kill people and make money.

This mod add 2 real repeatable quests (not daily quests) for fence trader:
- Kill contracts: kill 10 guys and earn money
- Dogtags collector: give 10 dogtags and earn money + 1 [GP coin](https://escapefromtarkov.fandom.com/wiki/GP_coin + increase fence loyalty (also called scav karma).

**Real repeatable quests** means once you completed a quest, **you can restart it directly**.

## Installation requirements
[`Custom Quests`](https://hub.sp-tarkov.com/files/file/701-baba-yaga/) (>= v3.2.0) should be installed.

## Configuration
In `config/config.json` file: 
- "kill contracts" and "dogtags collector" quests can be disabled independently
- number of needed kills and needed dogtags are configurable (these are the requirements to complete the quest one time)
- rewards are configurable (xp, money, fence loyalty, gp coins)
- the trader who gives you a certain quest (work with modded traders)
- `target` field for "kill contracts" can be `all`, `pmc` or `scav`

## Compatiblity
It's compatible with spt-aki 3.9.x

