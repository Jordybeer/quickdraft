---
name: Quickdraft
description: A one-handed tactical build rail for Yunara decisions inside Telegram.
colors:
  host-bg: "var(--tg-theme-bg-color, #0f1115)"
  host-surface: "var(--tg-theme-secondary-bg-color, #171a20)"
  host-text: "var(--tg-theme-text-color, #f3f5f7)"
  host-muted: "var(--tg-theme-hint-color, #9aa3ad)"
  host-accent: "var(--tg-theme-button-color, #5b8def)"
  host-accent-text: "var(--tg-theme-button-text-color, #ffffff)"
typography:
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.55rem, 6vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 600
rounded:
  sm: "10px"
  md: "14px"
spacing:
  compact: "7px"
  control: "12px"
  section: "22px"
components:
  primary-control:
    backgroundColor: "{colors.host-accent}"
    textColor: "{colors.host-accent-text}"
    rounded: "{rounded.sm}"
    height: "44px"
  input:
    backgroundColor: "{colors.host-surface}"
    textColor: "{colors.host-text}"
    rounded: "{rounded.sm}"
    height: "48px"
---

# Design System: Quickdraft

## Overview

**Creative North Star: "The Draft Rail"**

Quickdraft should feel like a tool already belonging inside Telegram rather than a separate game dashboard squeezed into a webview. The enemy five and the resulting item sequence carry the screen; metadata and explanations stay quiet until they matter. Density is intentional, but every tap target remains thumb-friendly.

Key characteristics: host-theme adaptive, flat and divided rather than card-heavy, one accent, fast scanning, no decorative game-client cosplay.

## Colors

The Mini App inherits Telegram theme variables so it remains legible in the user's actual light/dark setup. The host accent is reserved for current selection and decisive actions; warnings use restrained amber only when the ruleset is stale.

## Typography

Use the native system stack to make the Mini App feel immediate inside Telegram. Hierarchy comes from weight and scale, never novelty typography. Numeric confidence and freshness metadata use tabular numerals.

## Layout

The layout is mobile-first with a maximum reading width of 760px. Sections are separated by hairline rules rather than standalone cards. Five enemy slots remain visible as a single rail; results become one column on narrow phones. Controls are at least 44px tall and the picker uses a 16px input font to avoid iOS zoom.

## Elevation & Depth

The system is flat by default. Depth comes from tonal surface differences and selected-state fills; no resting drop shadows are used.

## Shapes

Controls use 10–14px radii. Pills are avoided except where a compact segmented control genuinely represents mutually exclusive state.

## Components

Enemy slots expose index, champion name, and active state without avatars. The item rail uses compact initial marks plus full item names so it works before any art pipeline exists. The segmented game-state control and checkbox rows use native semantics and visible focus states.

## Do's and Don'ts

Do make the recommended item order the strongest visual object after champion selection. Do surface stale patch data explicitly. Do keep reasons short and causal. Don't build a dashboard of equal-weight cards, hide the main recommendation behind a submit button, or invent freshness when upstream data fails.
