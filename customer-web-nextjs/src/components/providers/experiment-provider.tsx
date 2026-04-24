"use client";

import { useEffect } from "react";
import { useExperimentStore } from "@/stores/experiment-store";
import { useAuthStore } from "@/stores/auth-store";
import { useAssignExperimentsMutation } from "@/modules/experiment/experiment.service";
import { getCartSessionId } from "@/hooks/use-cart-snapshot-sync";

/**
 * Bootstraps experiment assignments on app mount.
 *
 * Subject identity rule:
 *   - Authenticated user → "u:{customer_id}" (stable across devices)
 *   - Guest              → "s:{cart_session_id}" (stable per browser)
 *
 * We only hit the assign endpoint once per subject per session; after that,
 * assignments live in localStorage (via experiment-store persist).
 */
export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const subject = useExperimentStore((s) => s.subject);
  const setSubject = useExperimentStore((s) => s.setSubject);
  const setAssignments = useExperimentStore((s) => s.setAssignments);
  const assign = useAssignExperimentsMutation();

  useEffect(() => {
    const userId = user?.id;
    const sessionId = getCartSessionId();
    const nextSubject = userId
      ? `u:${userId}`
      : sessionId
        ? `s:${sessionId}`
        : null;

    if (!nextSubject) return;
    if (subject === nextSubject) return;

    setSubject(nextSubject);

    assign.mutate(nextSubject, {
      onSuccess: (res) => setAssignments(res.assignments ?? {}),
    });
  }, [user?.id, subject]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
