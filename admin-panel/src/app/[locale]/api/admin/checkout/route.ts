import { Routes } from "@/config/routes";
import { SellerRoutes } from "@/config/sellerRoutes";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "",

  {
    //@ts-ignore
    apiVersion: "2022-11-15",
  }
);

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_ADMIN_FRONT_URL}/${Routes.storeList}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_ADMIN_FRONT_URL}/${Routes.dashboard}`,
    });

    return NextResponse.json({ url: session.url }); 
  } catch (error) {
   
    return NextResponse.json(
      { error: "Failed to create Stripe session" },
      { status: 500 }
    );
  }
}
