import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  return new Stripe(secretKey, {
    //@ts-ignore
    apiVersion: "2022-11-15",
  });
}
export async function GET(req: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const transactionId = session.payment_intent;

    return NextResponse.json({ transaction_id: transactionId });
  } catch (error) {
   
    return NextResponse.json(
      { error: "Failed to retrieve payment details" },
      { status: 500 }
    );
  }
}
