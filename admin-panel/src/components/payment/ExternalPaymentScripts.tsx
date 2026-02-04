"use client";

import { useEffect } from "react";

export const ExternalPaymentScripts = () => {
  useEffect(() => {
    // Razorpay script
    const razorpayScript = document.createElement("script");
    razorpayScript.src = "https://checkout.razorpay.com/v1/checkout.js";
    razorpayScript.async = true;
    document.body.appendChild(razorpayScript);

    // Paytm script
    const paytmScript = document.createElement("script");
    paytmScript.src =
      "https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/YOUR_MID_HERE.js";
    paytmScript.crossOrigin = "anonymous";
    paytmScript.async = true;
    document.body.appendChild(paytmScript);

    return () => {
      // Cleanup when component unmounts (optional but good practice)
      document.body.removeChild(razorpayScript);
      document.body.removeChild(paytmScript);
    };
  }, []);

  return null; // Component only loads scripts
};
