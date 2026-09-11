# Engine regression cases

Use these as screenshot/manual regression cases after engine changes. They are qualitative guardrails, not exact immutable build recipes.

## 1. Durable + cleanseable CC

Enemy: Camille / Cho'Gath / Braum / Ahri / Ashe

Expected:
- BORK should be a strong second-item branch.
- Infinity Edge must remain in the completed build.
- At most one penetration system should be present.
- Terminus/LDR may move before IE only when penetration pressure is high enough; otherwise IE comes first.
- QSS should be described as an early component timing decision, while Mercurial is a late completed item.
- Build should fill all six inventory slots including boots.

## 2. Squishy burst/dive

Enemy: Rengar / Kassadin / Jhin / Lulu / Zoe

Expected:
- Do not force BORK or penetration merely from role labels.
- BT or Kraken can win the second-item decision depending on state.
- IE should arrive early.
- A late defensive slot is reasonable when the assassin profile crosses the defensive threshold.

## 3. Frontline + sustain

Enemy: Ornn / Swain / Leona / Samira / Kindred

Expected:
- BORK should score strongly.
- Mortal Reminder should own the penetration slot when sustain is the decisive problem.
- Do not stack Mortal Reminder with Terminus/LDR.
- IE should still appear unless a future ruleset explicitly models a validated non-crit exception.

## 4. Mostly squishy poke with one tank

Enemy: Zoe / Kha'Zix / Ashe / Graves / Braum

Expected:
- One tank/support should not make the whole comp read as heavy frontline.
- BT/Kraken should remain competitive with BORK.
- Penetration should not be forced from Braum alone.
- QSS/Mercurial depends on cleanseable CC pressure, not total CC alone.

## Invariants

- Role tags are weak baselines; explicit champion profiles replace them rather than stacking on top.
- HP pressure and armor pressure are separate signals.
- Total hard CC and cleanseable CC are separate signals.
- A full defensive item is reserved for a late slot; component timing can be recommended earlier.
- Maximum one penetration item from Mortal Reminder / Lord Dominik's Regards / Terminus.
- Full path is six slots including boots.
