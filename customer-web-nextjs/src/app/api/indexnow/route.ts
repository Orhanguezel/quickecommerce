import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface IndexNowRequest {
  urls?: string[];
  url?: string;
  secret?: string;
}

function normalizeUrls(input: IndexNowRequest): string[] {
  const urls = input.urls?.length ? input.urls : input.url ? [input.url] : [];
  return urls
    .map((url) => url.trim())
    .filter((url) => url.startsWith(SITE_URL))
    .slice(0, 10000);
}

export async function POST(request: Request) {
  const key = process.env.INDEXNOW_KEY || process.env.NEXT_PUBLIC_INDEXNOW_KEY || "";
  const secret = process.env.INDEXNOW_SECRET || "";

  if (!key) {
    return Response.json({ error: "INDEXNOW_KEY is not configured" }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as IndexNowRequest;

  if (secret && body.secret !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urlList = normalizeUrls(body);
  if (urlList.length === 0) {
    return Response.json(
      { error: `Provide at least one URL under ${SITE_URL}` },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key,
      keyLocation: `${SITE_URL}/indexnow-key.txt`,
      urlList,
    }),
  });

  return Response.json(
    {
      submitted: urlList.length,
      status: response.status,
      ok: response.ok,
    },
    { status: response.ok ? 200 : 502 }
  );
}

