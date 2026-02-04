
import React from "react";
import { PublicNavbar } from "@/components/blocks/shared/PublicNavbar";
import EmailVerificationPage from "@/components/molecules/store-owner-form/EmailVerificationPage";
export default function EmailVerificationRoot() {
  return (
    <>
      <PublicNavbar />
      <EmailVerificationPage />
    </>
  );
}
