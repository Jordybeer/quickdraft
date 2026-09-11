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

const emptyPressure: ManualPressure = { hardCc: false, healing: false, burst: false };

function niceDate(value?: string | null) {
  if (!value) return "meta unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "meta date unknown" : `meta ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
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
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState<{ checked: boolean; authorized: boolean; configured: boolean; reason?: string }>({ checked: false, authorized: true, configured: false });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    webApp?.expand();

    Promise.all([
      fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: webApp?.initData ?? "" }),
      }).then(async (response) => ({ ok: response.ok, ...(await response.json()) })),
      fetch("/api/champions").then((response) => response.json()),
      fetch("/api/status").then((response) => response.json()),
    ]).then(([session, catalog, nextStatus]) => {
      setAccess({ checked: true, authorized: Boolean(session.authorized), configured: Boolean(session.configured), reason: session.reason });
      if (!session.authorized) return;
      const list = catalog.champions as Champion[];
      setChampions(list);
      setSourceDegraded(Boolean(catalog.degraded));
      setStatus(nextStatus);

      const params = new URLSearchParams(window.location.search);
      const raw = webApp?.initDataUnsafe?.start_param ?? params.get("comp") ?? params.get("startapp");
      const wanted = parseComp(raw).map(normalizeSlug);
      if (wanted.length) {
        const found = wanted
          .map((slug) => list.find((champion) => normalizeSlug(champion.id) === slug || normalizeSlug(champion.name) === slug))
          .filter((champion): champion is Champion => Boolean(champion));
        if (found.length) {
          setSelected(found.slice(0, 5));
          setActiveSlot(Math.min(found.length, 5));
        }
      }
    }).catch(() => { setSourceDegraded(true); setAccess((current) => ({ ...current, checked: true })); });
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
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setSelected([]);
    setActiveSlot(0);
    setQuery("");
    setState("even");
    setPressure(emptyPressure);
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  const patchLabel = status.patch?.latest ?? RULES_PATCH;
  const stale = Boolean(status.patch?.stale);
  const displayPath = selected.length < 3 ? [ITEMS.berserkers, ITEMS.magnetic] : recommendation.path;

  if (access.checked && !access.authorized) {
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

      {access.checked && !access.configured && <div className="warning" role="status">Preview mode: set Telegram secrets in Vercel to enable the owner lock and bot.</div>}
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
            <input
              ref={searchRef}
              id="champion-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search enemy ${activeSlot + 1}`}
              autoComplete="off"
              enterKeyHint="search"
            />
            <div className="results" role="listbox" aria-label="Champion results">
              {filtered.map((champion) => (
                <button key={champion.id} type="button" onClick={() => pick(champion)} role="option">
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
            <p>{selected.length < 3 ? "Add enemies for a stronger read." : `${recommendation.confidence}% rules confidence`}</p>
          </div>
          <button className="text-button" type="button" onClick={copyPath}>{copied ? "Copied" : "Copy path"}</button>
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

        <div className="segmented" aria-label="Current game state">
          {(["behind", "even", "ahead"] as GameState[]).map((option) => (
            <button key={option} type="button" className={state === option ? "is-selected" : ""} onClick={() => setState(option)}>{option}</button>
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
