import { fetchMetaStatus } from "@/lib/data";
import { fetchPatchStatus } from "@/lib/patch";
import { RULES_PATCH, RULES_VERSION } from "@/lib/recommendation";

export const runtime = "nodejs";

type Update = {
  message?: {
    chat?: { id?: number };
    from?: { id?: number };
    text?: string;
  };
};

async function telegram(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Telegram ${method} failed (${response.status})`);
  return response.json();
}

function adminKeyboard() {
  const appUrl = process.env.APP_URL;
  const rows: Record<string, unknown>[][] = [];
  if (appUrl) rows.push([{ text: "Open Quickdraft", web_app: { url: appUrl } }]);
  rows.push(
    [{ text: "Patch sync" }, { text: "Meta sync" }],
    [{ text: "Rebuild rules" }, { text: "Status" }],
  );
  return { keyboard: rows, resize_keyboard: true, is_persistent: true };
}

async function send(chatId: number, text: string) {
  return telegram("sendMessage", { chat_id: chatId, text, reply_markup: adminKeyboard(), disable_web_page_preview: true });
}

export async function POST(request: Request) {
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (configuredSecret) {
    const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (incomingSecret !== configuredSecret) return new Response("Forbidden", { status: 403 });
  }

  const update = (await request.json()) as Update;
  const message = update.message;
  const chatId = message?.chat?.id;
  const fromId = message?.from?.id;
  if (!chatId || !fromId) return Response.json({ ok: true });

  const ownerId = Number(process.env.TELEGRAM_OWNER_ID ?? 0);
  if (!ownerId || fromId !== ownerId) {
    await send(chatId, "Quickdraft is owner-only.");
    return Response.json({ ok: true });
  }

  const text = (message.text ?? "").trim().toLowerCase();

  if (text === "/start" || text === "start") {
    await send(chatId, "Quickdraft ready. Pick a sync action or open the Mini App.");
  } else if (text === "patch sync" || text === "/patch") {
    const patch = await fetchPatchStatus(true);
    await send(chatId, patch.stale
      ? `New patch detected: ${patch.latest}. Rules are tuned for ${patch.rulesPatch}; treat recommendations as stale until reviewed.`
      : `Patch sync OK. Riot latest: ${patch.latest}. Rules: ${patch.rulesPatch} (${patch.rulesVersion}).`);
  } else if (text === "meta sync" || text === "/meta") {
    const meta = await fetchMetaStatus(true);
    await send(chatId, meta.ok ? `Meta sync OK. CN dataset date: ${meta.date ?? "unknown"}.` : "Meta sync failed. Existing deterministic rules still work.");
  } else if (text === "rebuild rules" || text === "/rebuild") {
    const [patch, meta] = await Promise.all([fetchPatchStatus(true), fetchMetaStatus(true)]);
    await send(chatId, `Inputs refreshed. Rules remain deterministic and compile from the selected comp on every run. ${RULES_VERSION} / ${RULES_PATCH}. Riot: ${patch.latest}. Meta: ${meta.date ?? "unavailable"}.`);
  } else if (text === "status" || text === "/status") {
    const [patch, meta] = await Promise.all([fetchPatchStatus(), fetchMetaStatus()]);
    await send(chatId, `Rules ${RULES_VERSION} · patch ${RULES_PATCH}\nRiot latest: ${patch.latest}${patch.stale ? " (STALE)" : ""}\nCN meta: ${meta.date ?? "unavailable"}`);
  } else {
    await send(chatId, "Use the keyboard: Patch sync, Meta sync, Rebuild rules, Status, or open the Mini App.");
  }

  return Response.json({ ok: true });
}
