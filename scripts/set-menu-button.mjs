const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL;
if (!token || !appUrl) {
  console.error("Set TELEGRAM_BOT_TOKEN and APP_URL first.");
  process.exit(1);
}
const response = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ menu_button: { type: "web_app", text: "Quickdraft", web_app: { url: appUrl } } }),
});
const result = await response.json();
console.log(JSON.stringify(result, null, 2));
