export const dynamic = "force-dynamic";

export function GET() {
  const key = process.env.INDEXNOW_KEY || process.env.NEXT_PUBLIC_INDEXNOW_KEY || "";

  return new Response(key, {
    status: key ? 200 : 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

