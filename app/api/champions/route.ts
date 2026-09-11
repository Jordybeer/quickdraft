import { fetchChampions } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const result = await fetchChampions();
  return Response.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
