const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
if (!token || !appUrl || !secret) {
  console.error("Set TELEGRAM_BOT_TOKEN, APP_URL and TELEGRAM_WEBHOOK_SECRET first.");
  process.exit(1);
}
const url = `${appUrl.replace(/\/$/, "")}/api/telegram/webhook`;
const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url, secret_token: secret, allowed_updates: ["message"] }),
});
const result = await response.json();
console.log(JSON.stringify(result, null, 2));
