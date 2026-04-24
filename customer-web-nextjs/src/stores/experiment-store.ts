import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ExperimentState {
  /** Stable subject identifier — reused across experiments. */
  subject: string | null;
  /** Map of experiment_key → variant_key assigned to this subject. */
  assignments: Record<string, string>;
  /** Tracks which (experiment_key + variant_key) pairs have fired an "exposed" event locally. */
  exposedKeys: string[];

  setSubject: (subject: string) => void;
  setAssignments: (assignments: Record<string, string>) => void;
  markExposed: (experimentKey: string) => void;
  hasExposed: (experimentKey: string) => boolean;
  reset: () => void;
}

export const useExperimentStore = create<ExperimentState>()(
  persist(
    (set, get) => ({
      subject: null,
      assignments: {},
      exposedKeys: [],

      setSubject: (subject) => set({ subject }),
      setAssignments: (assignments) => set({ assignments }),

      markExposed: (experimentKey) => {
        if (get().exposedKeys.includes(experimentKey)) return;
        set((s) => ({ exposedKeys: [...s.exposedKeys, experimentKey] }));
      },

      hasExposed: (experimentKey) => get().exposedKeys.includes(experimentKey),

      reset: () => set({ subject: null, assignments: {}, exposedKeys: [] }),
    }),
    {
      name: "experiments-v1",
    }
  )
);
