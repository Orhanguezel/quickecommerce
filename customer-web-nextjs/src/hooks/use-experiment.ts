"use client";

import { useEffect } from "react";
import { useExperimentStore } from "@/stores/experiment-store";
import { useTrackExperimentMutation } from "@/modules/experiment/experiment.service";

/**
 * Returns the variant assigned to the current user for `experimentKey`,
 * or `null` if the user isn't enrolled (experiment not running, subject
 * outside traffic allocation, or assignment not loaded yet).
 *
 * Automatically fires an "exposed" event the first time the hook reads
 * a non-null variant, so the admin dashboard can compute exposure-based
 * conversion rates.
 *
 *   const variant = useExperiment("cart_block_order");
 *   if (variant === "variant_a") { ... }
 *
 * Pair with {@link trackConversion} when the downstream outcome fires.
 */
export function useExperiment(experimentKey: string): string | null {
  const subject = useExperimentStore((s) => s.subject);
  const assignments = useExperimentStore((s) => s.assignments);
  const markExposed = useExperimentStore((s) => s.markExposed);
  const hasExposed = useExperimentStore((s) => s.hasExposed);
  const track = useTrackExperimentMutation();

  const variant = assignments[experimentKey] ?? null;

  useEffect(() => {
    if (!subject || !variant) return;
    if (hasExposed(experimentKey)) return;

    markExposed(experimentKey);
    track.mutate({
      experiment_key: experimentKey,
      subject,
      event: "exposed",
    });
  }, [subject, variant, experimentKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return variant;
}

/** Fire a one-shot "converted" event for an experiment. */
export function useTrackConversion() {
  const subject = useExperimentStore((s) => s.subject);
  const track = useTrackExperimentMutation();

  return (experimentKey: string) => {
    if (!subject) return;
    track.mutate({
      experiment_key: experimentKey,
      subject,
      event: "converted",
    });
  };
}
