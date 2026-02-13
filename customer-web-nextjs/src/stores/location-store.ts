import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Area } from "@/modules/area/area.type";

interface LocationState {
  selectedArea: Area | null;
  isOpen: boolean;
  setSelectedArea: (area: Area | null) => void;
  openSelector: () => void;
  closeSelector: () => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedArea: null,
      isOpen: false,

      setSelectedArea: (area) => {
        set({ selectedArea: area, isOpen: false });
      },

      openSelector: () => {
        set({ isOpen: true });
      },

      closeSelector: () => {
        set({ isOpen: false });
      },

      clearLocation: () => {
        set({ selectedArea: null });
      },
    }),
    {
      name: "location-storage",
      partialize: (state) => ({
        selectedArea: state.selectedArea,
      }),
    }
  )
);
