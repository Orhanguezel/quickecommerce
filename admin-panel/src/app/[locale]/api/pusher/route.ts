
import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const { message, sender, channel, file_url, file_type,sender_type, timestamp } = await request.json();
   
   
    if ((!message?.trim() && !file_url) || !sender || !channel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await pusher.trigger(channel, "new-message", {
      message,
      sender,
      sender_type: sender_type,
      timestamp: timestamp || new Date().toISOString(),
      file_url: file_url ?? null,
      file_type: file_type ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
