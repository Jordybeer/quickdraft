# Quickdraft

A personal, Telegram-native Wild Rift decision tool for Yunara. Select the enemy five (or deep-link them from a Siri/ChatGPT screenshot workflow) and get a deterministic, patch-aware item path in seconds.

## Stack

- Next.js App Router + React + TypeScript
- Telegram Mini App using the official `telegram-web-app.js` bridge
- Telegram Bot API webhook for owner-only admin controls
- Vercel deployment
- Daily Wild Rift champion catalog + CN meta freshness from `ry2x` public datasets
- Riot patch-notes index used to detect when the local ruleset is stale

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The Mini App remains usable in a normal browser for development; Telegram adds `start_param`, haptics, theme variables, and the in-app launch context.

## Telegram setup

Set these secrets in Vercel (never commit them):

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_OWNER_ID`
- `TELEGRAM_WEBHOOK_SECRET`
- `APP_URL`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`

After deployment, register the webhook and menu button from a trusted shell with the same environment variables:

```bash
npm run telegram:register
npm run telegram:menu
```

The bot keyboard exposes **Patch sync**, **Meta sync**, **Rebuild rules**, and **Status**. All admin actions are owner-only.

## Screenshot / Siri deep link

Normalize five detected champions and open:

```text
https://t.me/<BOT_USERNAME>/<APP_SHORT_NAME>?startapp=brand_irelia_viego_ashe_thresh
```

The app also accepts `?comp=brand,irelia,viego,ashe,thresh` as a browser/debug fallback.

## Rules

The initial ruleset is tuned for Wild Rift **7.2e**. It deliberately separates three second-item jobs after Magnetic Blaster:

- **Kraken Slayer** — cheap midgame tempo into mostly squishy teams when uptime is safe
- **Blade of the Ruined King** — repeated-hit / HP-shred branch into durable melee targets
- **Bloodthirster** — stabilize when burst/poke prevents you from actually auto-attacking

Penetration and defense branch afterward into Mortal Reminder, LDR, Terminus, IE, Mercurial, Maw, or Guardian Angel according to the selected comp and manual game-state overrides.

The app surfaces when Riot has moved to a newer patch instead of pretending an old ruleset is current.
