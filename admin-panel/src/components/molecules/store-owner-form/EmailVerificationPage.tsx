"use client";
import { Button, Card } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import {
  useResendVerificationEmailMutation,
  useSendVerificationEmailMutation,
  useVerifyTokenByEmailMutation,
} from "@/modules/users/users.action";
import { useAppDispatch } from "@/redux/hooks";
import { setDynamicValue, setRefetch } from "@/redux/slices/refetchSlice";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import Loader from "../Loader";

export default function EmailVerificationPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email") || "";
    setEmail(storedEmail);
  }, []);
  const {
    mutate: SendVerificationEmail,
    isPending: isSendVerificationEmailPending,
  } = useSendVerificationEmailMutation();
  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || email.trim() === "") {
      toast.error("Please enter your email address.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const submissionData = {
      email: email.trim(),
    };
    SendVerificationEmail(submissionData, {
      onSuccess: () => {
        setStep(2);
        setResendDisabled(true);
        setCountdown(180);
      },
    });
  };

  const {
    mutate: ResendVerificationEmail,
    isPending: isResendVerificationEmailPending,
  } = useResendVerificationEmailMutation();
  const resendToken = async () => {
    if (!email || email.trim() === "") {
      toast.error("First entry your email address.");
      setStep(1);
      return;
    }
    const submissionData = {
      email: email.trim(),
    };
    ResendVerificationEmail(submissionData, {
      onSuccess: () => {
        setCountdown(180);
        setResendDisabled(true);
      },
    });
  };

  const { mutate: VerifyEmail, isPending: isVerifyEmailPending } =
    useVerifyTokenByEmailMutation();
  const verifyToken = async () => {
    const submissionData = {
      token: code.trim(),
    };
    VerifyEmail(submissionData, {
      onSuccess: () => {
        router.push(`${SellerRoutes.dashboard}`);
        dispatch(setSelectedStore({ id: "", type: "", slug: "" }));
        localStorage.setItem(
          "selectedStore",
          JSON.stringify({ id: "", slug: "" })
        );
        dispatch(setRefetch(true));
        dispatch(setDynamicValue("store_dashboard"));
      },
    });
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  return (
    <div className="bg-[#F3F4F6] dark:bg-gray-900 w-full h-full  px-4 ">
      <div className="h-[91.3vh] flex items-center justify-center">
        <Card className=" max-w-md w-full  p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {t("common.email_verification")}
          </h1>

          {step === 1 ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t("common.enter_your_email")}
              </h2>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <Button
                disabled={isSendVerificationEmailPending}
                onClick={verifyEmail}
                className="w-full flex items-center justify-center gap-2 py-2 app-button rounded"
              >
                {isSendVerificationEmailPending && <Loader size="small" />}{" "}
                {t("common.verify")}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {t("common.please_check_your_email")}{" "}
                <span className="font-medium text-black">{email}</span>{" "}
                {t("common.for_the_verification_token")}
              </p>

              <input
                type="text"
                placeholder="Enter verification token"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                type="button"
                className="mt-2 block text-blue-600 dark:text-white  hover:underline cursor-pointer disabled:text-gray-400"
                onClick={resendToken}
                disabled={resendDisabled}
              >
                {resendDisabled ? `Resend in ${countdown}s` : "Resend Token"}
              </button>

              <Button
                disabled={isVerifyEmailPending || code == ""}
                onClick={verifyToken}
                className="w-full flex items-center justify-center gap-2 rounded-md py-2 app-button"
              >
                {isVerifyEmailPending && <Loader size="small" />}{" "}
                {t("button.submit")}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
