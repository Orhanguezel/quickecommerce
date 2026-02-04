import { NextResponse } from "next/server";
import PaytmChecksum from "paytmchecksum";
import https from "https";

const MID = process.env.PAYTM_MID!;
const MKEY = process.env.PAYTM_MKEY!;
const WEBSITE = "WEBSTAGING";
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_ADMIN_FRONT_URL}/paytm-callback`;

interface PaytmRequestBody {
  requestType: string;
  mid: string;
  websiteName: string;
  orderId: string;
  callbackUrl: string;
  txnAmount: {
    value: string;
    currency: string;
  };
  userInfo: {
    custId: string;
  };
}

interface PaytmParams {
  body: PaytmRequestBody;
  head: {
    signature: string;
  };
}

interface PaytmResponse {
  body: {
    txnToken: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { amount, orderId, customerId } = await req.json();
    const initialParams = {
      body: {
        requestType: "Payment",
        mid: MID,
        websiteName: WEBSITE,
        orderId,
        callbackUrl: CALLBACK_URL,
        txnAmount: {
          value: amount.toString(),
          currency: "INR",
        },
        userInfo: {
          custId: customerId,
        },
      },
    };

    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(initialParams.body),
      MKEY
    );

    const completeParams: PaytmParams = {
      ...initialParams,
      head: {
        signature: checksum,
      },
    };

    const data = JSON.stringify(completeParams);
    
    return new Promise<Response>((resolve) => {
      const request = https.request({
        hostname: "securegw-stage.paytm.in",
        port: 443,
        path: `/theia/api/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length.toString(),
        },
      }, (response) => {
        let resData = "";
        response.on("data", (chunk) => {
          resData += chunk;
        });

        response.on("end", () => {
          try {
            const result: PaytmResponse = JSON.parse(resData);
            if (result.body?.txnToken) {
              resolve(NextResponse.json({
                txnToken: result.body.txnToken,
                orderId,
                amount,
              }));
            } else {
              resolve(NextResponse.json(
                { error: "Invalid response from Paytm" },
                { status: 500 }
              ));
            }
          } catch (parseError) {
            resolve(NextResponse.json(
              { error: "Failed to parse Paytm response" },
              { status: 500 }
            ));
          }
        });
      });

      request.on("error", (error) => {
        resolve(NextResponse.json(
          { error: "Failed to create Paytm transaction" },
          { status: 500 }
        ));
      });

      request.write(data);
      request.end();
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}