import { fetchMetaStatus } from "@/lib/data";
import { fetchPatchStatus } from "@/lib/patch";

export const runtime = "nodejs";

export async function GET() {
  const [patch, meta] = await Promise.all([fetchPatchStatus(), fetchMetaStatus()]);
  return Response.json({ patch, meta, checkedAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
  });
}
