
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url");
  if (!imageUrl) {
    return new Response("Missing URL", { status: 400 });
  }

  try {
    const imageRes = await fetch(imageUrl);
    const blob = await imageRes.blob();
    const buffer = await blob.arrayBuffer();

    return new Response(Buffer.from(buffer), {
      headers: {
        "Content-Type": imageRes.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response("Failed to fetch image", { status: 500 });
  }
}
