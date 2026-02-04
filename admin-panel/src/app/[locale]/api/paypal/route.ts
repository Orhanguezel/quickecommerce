import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  try {
    const authResponse = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT,
          password: PAYPAL_SECRET,
        },
      }
    );

    const accessToken = authResponse.data.access_token;
    const orderResponse = await axios.get(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(orderResponse.data);
  } catch (error) {
   
    return NextResponse.json({ error: "Payment validation failed" }, { status: 500 });
  }
}
