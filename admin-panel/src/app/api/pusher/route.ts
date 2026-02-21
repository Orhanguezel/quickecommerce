import { NextResponse } from "next/server";
import Pusher from "pusher";

function getPusherClient(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY ?? process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster =
    process.env.PUSHER_CLUSTER ?? process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

export async function POST(request: Request) {
  try {
    const {
      message,
      sender,
      channel,
      file_url,
      file_type,
      sender_type,
      timestamp,
    } = await request.json();

    if ((!message?.trim() && !file_url) || !sender || !channel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pusher = getPusherClient();
    if (!pusher) {
      return NextResponse.json({
        success: true,
        skipped: "pusher_not_configured",
      });
    }

    await pusher.trigger(channel, "new-message", {
      message,
      sender,
      sender_type,
      timestamp: timestamp || new Date().toISOString(),
      file_url: file_url ?? null,
      file_type: file_type ?? null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
