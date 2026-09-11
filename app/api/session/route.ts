import { validateTelegramInitData } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ownerId = Number(process.env.TELEGRAM_OWNER_ID ?? 0);

  // Before secrets are configured, keep preview/development usable and make the setup state explicit.
  if (!token || !ownerId) {
    return Response.json({ authorized: true, configured: false, reason: "Telegram owner lock not configured yet" });
  }

  const body = (await request.json().catch(() => ({}))) as { initData?: string };
  if (!body.initData) return Response.json({ authorized: false, configured: true, reason: "Open Quickdraft from Telegram" }, { status: 401 });

  const result = validateTelegramInitData(body.initData, token);
  if (!result.valid) {
    const reason = result.reason === "expired"
      ? "Telegram session expired — close Quickdraft and reopen it from the bot"
      : "Telegram session could not be verified";
    return Response.json({ authorized: false, configured: true, reason, authFailure: result.reason }, { status: 401 });
  }
  if (result.userId !== ownerId) return Response.json({ authorized: false, configured: true, reason: "Quickdraft is owner-only" }, { status: 403 });

  return Response.json({ authorized: true, configured: true });
}
