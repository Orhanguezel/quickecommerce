// =============================================================
// FILE: src/lib/GlobalClientLayer.tsx
// FINAL — stable client-only layer
// =============================================================

"use client";

import { ToastContainer } from "react-toastify";
import { ServiceWorkerRegistration } from "@/components/utils/ServiceWorkerRegistration";
import "react-toastify/dist/ReactToastify.css";

export function GlobalClientLayer() {
  return (
    <>
      <ToastContainer autoClose={2000} theme="colored" />
      <ServiceWorkerRegistration />
    </>
  );
}
