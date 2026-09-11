# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js + React + TypeScript, Telegram Mini Apps SDK, Vercel/serverless. No Vite.

## Users

Primary and only intended user: the owner. The product is a personal Wild Rift decision-support tool used during champion select, loading screen, and between games to choose Yunara item paths quickly from the enemy composition and current game context.

## Product Purpose

Provide fast, patch-aware Yunara build recommendations without requiring a fresh AI conversation for every game. Success means the owner can get from enemy composition to a defensible item path in seconds, with the recommendation adapting to current patch data, enemy composition, and key game-state constraints.

## Positioning

The product combines a deterministic, explainable build engine with current patch/meta data and a Telegram-native workflow. AI is optional and reserved for image recognition or unusual edge cases rather than being required for every recommendation.

## Operating Context

- Opened as a Telegram Mini App from a personal bot.
- Enemy composition can be selected manually through a fast champion picker.
- A Siri/ChatGPT shortcut may extract champions from a screenshot and pass the normalized composition to the Mini App through a Telegram `startapp` deep link; clipboard/paste remains a fallback.
- The owner can use bot commands or a custom admin keyboard to trigger patch sync, meta sync, rules rebuild, status checks, and later rollback/inspection workflows.
- Recommendations are expected to be useful during short decision windows, so latency and scanability matter more than conversational depth.

## Capabilities and Constraints

- Deterministic rules/scoring engine for item-path recommendations.
- Initial focus is Yunara, with item branches such as Magnetic Blaster, Kraken Slayer, Blade of the Ruined King, Infinity Edge, Bloodthirster, Mortal Reminder, Lord Dominik's Regards, Terminus, Guardian Angel, Maw, and Mercurial based on matchup and game conditions.
- Recommendation inputs should include enemy composition and may later include behind/even/ahead state, fed threats, healing, CC, frontline durability, burst profile, and current gold/item state.
- Patch-aware, versioned data rather than hardcoded timeless assumptions.
- Riot patch information is the source of truth for balance changes; high-elo/meta data can supplement it where a reliable source is available.
- Data freshness must be visible. Stale or incomplete meta data should be surfaced rather than silently treated as current.
- Optional AI may be used for screenshot champion recognition and genuinely ambiguous game-state reasoning, but normal build selection must work without an LLM call.
- Bot mutation/admin controls are owner-only.
- V1 should stay small: one fast Mini App surface, no account system, no unnecessary database complexity.
- Reliable automated access to high-elo build data is still an open implementation decision and must not be assumed until a stable source is verified.

## Product Principles

1. Fast enough to use before the game starts or during a recall.
2. Explainable recommendations: show the decisive reasons, not just an item list.
3. Patch truth beats stale build folklore.
4. Deterministic by default; AI only where it adds clear value.
5. Prefer a small reliable tool over a broad feature-heavy companion app.

## Accessibility & Inclusion

The primary surface should be comfortably usable one-handed on a phone inside Telegram, with large tap targets, concise labels, strong contrast, and no interaction that depends on hover.
