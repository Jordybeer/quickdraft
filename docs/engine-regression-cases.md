# Engine regression cases

Use these as screenshot/manual regression cases after engine changes. They are qualitative guardrails, not exact immutable build recipes.

## 1. Frontline + sustain + engage

Enemy: Ornn / Viego / Swain / Samira / Leona

Expected:
- BORK should be a strong second-item call.
- Mortal Reminder should own the penetration slot when the sustain profile is decisive.
- Standard defense may end in Guardian Angel when physical dive is the larger death check.
- `CC decides fights` should be able to tip the late defense toward Mercurial without rewriting the damage core.
- A `Healing is a problem` override should not stack a second anti-heal item when Mortal already covers it.

## 2. Squishy burst + dive

Enemy: Camille / Kha'Zix / Ahri / Jhin / Lulu

Expected:
- Bloodthirster should beat BORK as the default second item because uptime is the limiting resource.
- Infinity Edge should stay early and Kraken can appear later as a damage/tempo slot.
- QSS can be recommended as a timing component without automatically forcing Mercurial as the final defensive item.
- Guardian Angel should beat Mercurial by default when physical burst + dive is the larger death check.
- `CC decides fights` should be able to tip that late slot to Mercurial.

## 3. Extreme armor + CC

Enemy: Malphite / Rammus / Veigar / Ashe / Nautilus

Expected:
- BORK should score strongly.
- Terminus/penetration should be allowed before IE because armor pressure is urgent.
- Mercurial is a valid late defensive completion because cleanseable CC is a major fight condition.
- Mercury's Treads should become a valid/default boot branch only at unusually high combined CC + magic pressure; do not generalize defensive boots to ordinary drafts.
- Advice must still warn that QSS does not solve the non-cleanseable part of the CC profile.

## 4. AP-heavy dive without a tank wall

Enemy: Gwen / Hecarim / Kassadin / Kai'Sa / Milio

Expected:
- Bloodthirster should be the default second-item call.
- Do not force penetration from role labels.
- Infinity Edge should stay early and Kraken can appear later.
- Maw should beat generic physical defense when magic burst is the dominant late damage check.
- BORK should not be labeled a close branch unless its second-item score is genuinely close to BT.
- Reasons should explicitly explain BT and Maw when those are the important choices.

## 5. Poke + one real tank

Enemy: Sion / Graves / Ziggs / Caitlyn / Janna

Expected:
- Bloodthirster should be competitive/default because poke pressure is high and dive is low.
- BORK second is a believable close branch because Sion still creates real HP pressure.
- One tank should not force a penetration item by itself.
- Do not recommend Mercurial from total CC when cleanseable CC is low.
- Copy must never say `after QSS` when QSS is not actually being recommended; explain that spacing/target selection solves mostly non-cleanseable CC instead.

## 6. Rumble + Rell mixed pressure

Enemy: Rumble / Jarvan IV / Yone / Jhin / Rell

Expected:
- Rumble must contribute meaningful magic/poke pressure rather than a tiny generic mage baseline.
- Rell must contribute real armor/frontline + engage pressure.
- Bloodthirster remains a valid second-item call because poke/dive can gate uptime.
- With Rell modeled properly, a late LDR branch after BT + IE is allowed when armor pressure crosses the penetration threshold; BORK must not win merely because one durability scalar is slightly above a filler cutoff.
- Guardian Angel remains a strong late defense when Yone/Jarvan/Jhin physical dive is the larger death check.

## 7. Physical dive + Maokai

Enemy: Zed / Viego / Yasuo / Lucian / Maokai

Expected:
- Lucian must contribute real physical burst instead of an almost-empty marksman fallback.
- Maokai must contribute HP/frontline, sustain and substantial CC.
- Bloodthirster should remain strong second because usable uptime is the limiting resource.
- Kraken can remain the late damage slot when armor pressure is still light.
- Guardian Angel should normally beat Mercurial when physical burst + dive remains the dominant death check, even if `CC decides fights` raises QSS value.

## Context overrides

- `Getting bursted` should materially raise BT/survival value, but it does not have to change a path when a matchup-specific second item still wins by a wide margin.
- `CC decides fights` raises QSS/Mercurial value; the late completed defense should still compare cleanse value against GA/Maw rather than hard-forcing Mercurial from one threshold.
- `Healing is a problem` is an explicit user signal and should force Mortal Reminder to own the single penetration slot.
- Behind/even/ahead are tie-breakers and tempo biases, not commands to make every draft produce three different paths.
- If an override is already covered by the current path, notes should say so rather than silently appearing broken.

## Coverage

- Current live champion IDs must be matched exactly; aliases such as the catalog's `MonkeyKing` must not silently miss a tuned Wukong profile.
- If any selected champion has no tuned profile, the recommendation must disclose the fallback names in notes and reduce confidence rather than presenting the weak role baseline as equally certain.
- Adding a tuned profile should improve the threat read without rewriting the global scoring thresholds unless regression cases show a separate scoring problem.

## Invariants

- Role tags are weak baselines; explicit champion profiles replace them rather than stacking on top.
- HP pressure and armor pressure are separate signals.
- Total hard CC and cleanseable CC are separate signals.
- QSS timing and Mercurial completion are separate decisions.
- A full defensive item is reserved for a late slot; component timing can be recommended earlier.
- Maximum one penetration item from Mortal Reminder / Lord Dominik's Regards / Terminus.
- Infinity Edge remains the crit payoff unless a future validated ruleset explicitly models a non-crit exception.
- Full path is six slots including boots.
