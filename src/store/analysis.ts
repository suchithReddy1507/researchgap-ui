import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AnalyzeResponse } from "@/lib/api";

export interface PendingRequest {
  topic: string;
  papers: number;
}

interface AnalysisState {
  pendingRequest: PendingRequest | null;
  /** The in-flight background job for pendingRequest, if one has been
   * created — lets /processing resume polling after a refresh instead of
   * firing a second, duplicate POST /analyze for the same request. */
  activeJobId: string | null;
  result: AnalyzeResponse | null;
  setPendingRequest: (req: PendingRequest) => void;
  setActiveJobId: (jobId: string | null) => void;
  setResult: (result: AnalyzeResponse) => void;
  reset: () => void;
}

/** Last analysis, kept alive across the /processing -> /dashboard -> /report
 * navigation and restored from sessionStorage on refresh. */
export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      pendingRequest: null,
      activeJobId: null,
      result: null,
      setPendingRequest: (pendingRequest) => set({ pendingRequest, activeJobId: null }),
      setActiveJobId: (activeJobId) => set({ activeJobId }),
      setResult: (result) => set({ result, pendingRequest: null, activeJobId: null }),
      reset: () => set({ pendingRequest: null, activeJobId: null, result: null }),
    }),
    {
      name: "researchgap-analysis",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
