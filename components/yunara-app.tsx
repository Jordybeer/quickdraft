"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { recommendBuild, RULES_PATCH } from "@/lib/recommendation";
import { ITEMS } from "@/lib/items";
import { normalizeSlug, parseComp } from "@/lib/telegram";
import type { Champion, GameState, ManualPressure } from "@/lib/types";

type Status = {
  patch?: { latest?: string; stale?: boolean; ok?: boolean };
  meta?: { date?: string | null; ok?: boolean };
};

type AccessState = {
  checked: boolean;
  authorized: boolean;
  configured: boolean;
  reason?: string;
};

type CopyState = "idle" | "copied" | "failed";

const emptyPressure: ManualPressure = { hardCc: false, healing: false, burst: false };

function niceDate(value?: string | null) {
  if (!value) return "meta unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "meta date unknown" : `meta ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function rulePreference(confidence: number) {
  if (confidence >= 84) return "Clear rules preference";
  if (confidence >= 70) return "Moderate rules preference";
  return "Close rules call";
}

async function jsonOrThrow(response: Response) {
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json();
}

export default function YunaraApp() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [selected, setSelected] = useState<Champion[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<GameState>("even");
  const [pressure, setPressure] = useState<ManualPressure>(emptyPressure);
  const [status, setStatus] = useState<Status>({});
  const [sourceDegraded, setSourceDegraded] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [access, setAccess] = useState<AccessState>({ checked: false, authorized: false, configured: false });
  const searchRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    webApp?.expand();

    async function load() {
      let session: { authorized?: boolean; configured?: boolean; reason?: string };
      try {
        const response = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: webApp?.initData ?? "" }),
        });
        session = await response.json();
      } catch {
        if (!cancelled) {
          setAccess({
            checked: true,
            authorized: false,
            configured: true,
            reason: "Couldn’t verify your Telegram session. Reopen Quickdraft from the bot.",
          });
        }
        return;
      }

      if (cancelled) return;
      const nextAccess = {
        checked: true,
        authorized: Boolean(session.authorized),
        configured: Boolean(session.configured),
        reason: session.reason,
      };
      setAccess(nextAccess);
      if (!nextAccess.authorized) return;

      const [catalogResult, statusResult] = await Promise.allSettled([
        fetch("/api/champions").then(jsonOrThrow),
        fetch("/api/status").then(jsonOrThrow),
      ]);
      if (cancelled) return;

      let list: Champion[] = [];
      if (catalogResult.status === "fulfilled") {
        const catalog = catalogResult.value as { champions?: Champion[]; degraded?: boolean };
        list = catalog.champions ?? [];
        setChampions(list);
        setSourceDegraded(Boolean(catalog.degraded));
      } else {
        setSourceDegraded(true);
      }

      if (statusResult.status === "fulfilled") setStatus(statusResult.value as Status);

      if (!list.length) return;
      const params = new URLSearchParams(window.location.search);
      const raw = webApp?.initDataUnsafe?.start_param ?? params.get("comp") ?? params.get("startapp");
      const wanted = parseComp(raw).map(normalizeSlug);
      if (!wanted.length) return;

      const found = wanted
        .map((slug) => list.find((champion) => normalizeSlug(champion.id) === slug || normalizeSlug(champion.name) === slug))
        .filter((champion): champion is Champion => Boolean(champion));
      if (found.length) {
        setSelected(found.slice(0, 5));
        setActiveSlot(Math.min(found.length, 5));
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const recommendation = useMemo(() => recommendBuild(selected, state, pressure), [selected, state, pressure]);

  const filtered = useMemo(() => {
    const needle = normalizeSlug(query);
    return champions
      .filter((champion) => !selected.some((pick) => pick.id === champion.id))
      .filter((champion) => !needle || normalizeSlug(champion.name).includes(needle) || normalizeSlug(champion.id).includes(needle))
      .slice(0, 18);
  }, [champions, query, selected]);

  function pick(champion: Champion) {
    const next = [...selected];
    if (activeSlot < next.length) next[activeSlot] = champion;
    else next.push(champion);
    const unique = next.filter((entry, index, all) => all.findIndex((candidate) => candidate.id === entry.id) === index).slice(0, 5);
    setSelected(unique);
    setQuery("");
    const nextSlot = Math.min(activeSlot + 1, 5);
    setActiveSlot(nextSlot);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  async function copyPath() {
    const items = selected.length < 3 ? [ITEMS.berserkers, ITEMS.magnetic] : recommendation.path;
    const path = items.map((item) => item.name).join(" → ");
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);

    try {
      await navigator.clipboard.writeText(path);
      setCopyState("copied");
      copyTimerRef.current = window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("failed");
      copyTimerRef.current = window.setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  function reset() {
    setSelected([]);
    setActiveSlot(0);
    setQuery("");
    setState("even");
    setPressure(emptyPressure);
    setCopyState("idle");
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  const patchLabel = status.patch?.latest ?? RULES_PATCH;
  const stale = Boolean(status.patch?.stale);
  const displayPath = selected.length < 3 ? [ITEMS.berserkers, ITEMS.magnetic] : recommendation.path;
  const copyAnnouncement = copyState === "copied"
    ? "Build path copied to clipboard."
    : copyState === "failed"
      ? "Couldn’t copy the build path. Select and copy it manually."
      : "";

  if (!access.checked) {
    return (
      <div className="access-state" aria-live="polite">
        <h1>Quickdraft</h1>
        <p>Checking Telegram session…</p>
      </div>
    );
  }

  if (!access.authorized) {
    return (
      <div className="access-state">
        <h1>Quickdraft</h1>
        <p>{access.reason ?? "Owner access only."}</p>
      </div>
    );
  }

  return (
    <div className="app-frame">
      <header className="topline">
        <div>
          <h1>Quickdraft</h1>
          <p>Yunara build path from the comp, not vibes.</p>
        </div>
        <div className={`freshness ${stale ? "freshness--stale" : ""}`} title="Patch and dataset freshness">
          <span>{stale ? `rules ${RULES_PATCH} / live ${patchLabel}` : `patch ${patchLabel}`}</span>
          <span>{niceDate(status.meta?.date)}</span>
        </div>
      </header>

      {!access.configured && <div className="warning" role="status">Preview mode: set Telegram secrets in Vercel to enable the owner lock and bot.</div>}
      {stale && <div className="warning" role="status">New Riot patch detected. Recommendations still run, but the ruleset needs review.</div>}
      {sourceDegraded && <div className="warning" role="status">Champion data source is degraded; using a smaller fallback catalog.</div>}

      <section className="draft" aria-labelledby="enemy-heading">
        <div className="section-head">
          <div>
            <h2 id="enemy-heading">Enemy five</h2>
            <p>Tap a slot, then type. Selection advances automatically.</p>
          </div>
          <button className="text-button" type="button" onClick={reset}>Reset</button>
        </div>

        <div className="enemy-rail" aria-label="Enemy composition">
          {Array.from({ length: 5 }, (_, index) => {
            const pick = selected[index];
            return (
              <div className="enemy-slot-wrap" key={index}>
                <button
                  type="button"
                  className={`enemy-slot ${activeSlot === index ? "enemy-slot--active" : ""} ${pick ? "enemy-slot--filled" : ""}`}
                  onClick={() => { setActiveSlot(index); setQuery(""); requestAnimationFrame(() => searchRef.current?.focus()); }}
                  aria-label={pick ? `Enemy ${index + 1}: ${pick.name}. Tap to replace.` : `Choose enemy ${index + 1}`}
                >
                  <span className="slot-index">{index + 1}</span>
                  <span className="slot-name">{pick?.name ?? "Choose"}</span>
                </button>
              </div>
            );
          })}
        </div>

        {activeSlot < 5 ? (
          <div className="picker">
            <label htmlFor="champion-search">Champion</label>
            <p id="champion-picker-help" className="sr-only">Type to filter champions, then Tab to a result and press Enter to select it.</p>
            <input
              ref={searchRef}
              id="champion-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search enemy ${activeSlot + 1}`}
              autoComplete="off"
              enterKeyHint="search"
              aria-describedby="champion-picker-help"
              aria-controls="champion-results"
            />
            <div id="champion-results" className="results" role="group" aria-label="Champion results">
              {filtered.map((champion) => (
                <button key={champion.id} type="button" onClick={() => pick(champion)}>
                  <span>{champion.name}</span>
                  <small>{champion.roles.slice(0, 2).join(" · ")}</small>
                </button>
              ))}
              {!champions.length && <p className="empty">Loading champions…</p>}
              {champions.length > 0 && !filtered.length && <p className="empty">No match.</p>}
            </div>
          </div>
        ) : null}
      </section>

      <section className="recommendation" aria-labelledby="path-heading">
        <div className="section-head section-head--path">
          <div>
            <h2 id="path-heading">Best path now</h2>
            <p>{selected.length < 3 ? "Add enemies for a stronger read." : rulePreference(recommendation.confidence)}</p>
          </div>
          <button className="text-button" type="button" onClick={copyPath}>{copyState === "copied" ? "Copied" : "Copy path"}</button>
          <span className="sr-only" role="status" aria-live="polite">{copyAnnouncement}</span>
        </div>

        <div className="build-rail" aria-label="Recommended item order">
          {displayPath.map((item, index) => (
            <div className="build-step" key={`${item.id}-${index}`}>
              <div className="item-mark">{item.short}</div>
              <div className="item-copy"><strong>{item.name}</strong><span>{item.role}</span></div>
              {index < displayPath.length - 1 && <span className="arrow" aria-hidden="true">→</span>}
            </div>
          ))}
        </div>

        {recommendation.alternative && selected.length >= 3 && (
          <div className="alternative">
            <span>Close branch</span>
            <strong>{recommendation.alternative.map((item) => item.short).join(" → ")}</strong>
          </div>
        )}

        {selected.length >= 3 && (
          <div className="reason-list">
            {recommendation.reasons.map((reason) => <p key={reason}>{reason}</p>)}
          </div>
        )}
      </section>

      <section className="context" aria-labelledby="context-heading">
        <div className="section-head">
          <div>
            <h2 id="context-heading">Game context</h2>
            <p>Only override what the comp cannot tell us.</p>
          </div>
        </div>

        <div className="segmented" role="group" aria-label="Current game state">
          {(["behind", "even", "ahead"] as GameState[]).map((option) => (
            <button
              key={option}
              type="button"
              className={state === option ? "is-selected" : ""}
              aria-pressed={state === option}
              onClick={() => setState(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="pressure-grid">
          {([
            ["burst", "Getting bursted"],
            ["hardCc", "CC decides fights"],
            ["healing", "Healing is a problem"],
          ] as const).map(([key, label]) => (
            <label key={key} className="toggle-row">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={pressure[key]}
                onChange={(event) => setPressure((current) => ({ ...current, [key]: event.target.checked }))}
              />
            </label>
          ))}
        </div>

        <div className="notes">
          {recommendation.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </section>

      <footer className="footer">
        <span>Rules {RULES_PATCH}</span>
        <span>Deterministic · no LLM call</span>
      </footer>
    </div>
  );
}
