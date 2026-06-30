"use client";

import { create } from "zustand";
import { buildImprovedResumeText } from "@/features/analysis/scoring";
import { clamp } from "@/lib/utils";
import type { AnalysisPayload, ResumeSuggestion } from "@/types/resume";

type ResumeState = {
  payload?: AnalysisPayload;
  setPayload: (payload: AnalysisPayload) => void;
  updateSuggestion: (id: string, accepted: boolean) => void;
  acceptAllSafeSuggestions: () => void;
  rejectAllSuggestions: () => void;
};

function rebuildPayload(payload: AnalysisPayload, suggestions: ResumeSuggestion[]): AnalysisPayload {
  const originalScore = payload.versions.find((version) => version.id === "original")?.score ?? payload.analysis.overallScore;
  const acceptedImpact = suggestions
    .filter((suggestion) => suggestion.accepted && !suggestion.requiresConfirmation)
    .reduce((sum, suggestion) => sum + suggestion.expectedScoreImpact, 0);
  const overallScore = clamp(Math.round(originalScore + acceptedImpact), 0, payload.analysis.potentialScore);

  return {
    ...payload,
    improvedResumeText: buildImprovedResumeText(payload.resume.originalText, suggestions),
    analysis: {
      ...payload.analysis,
      overallScore,
      suggestions
    },
    versions: payload.versions.map((version) =>
      version.id === "optimized" ? { ...version, score: overallScore } : version
    )
  };
}

export const useResumeStore = create<ResumeState>((set) => ({
  setPayload: (payload) => set({ payload }),
  updateSuggestion: (id, accepted) =>
    set((state) => {
      if (!state.payload) return state;
      const suggestions: ResumeSuggestion[] = state.payload.analysis.suggestions.map((suggestion) =>
        suggestion.id === id && !suggestion.requiresConfirmation ? { ...suggestion, accepted } : suggestion
      );
      return { payload: rebuildPayload(state.payload, suggestions) };
    }),
  acceptAllSafeSuggestions: () =>
    set((state) => {
      if (!state.payload) return state;
      const suggestions = state.payload.analysis.suggestions.map((suggestion) => ({
        ...suggestion,
        accepted: !suggestion.requiresConfirmation
      }));
      return { payload: rebuildPayload(state.payload, suggestions) };
    }),
  rejectAllSuggestions: () =>
    set((state) => {
      if (!state.payload) return state;
      const suggestions = state.payload.analysis.suggestions.map((suggestion) => ({ ...suggestion, accepted: false }));
      return { payload: rebuildPayload(state.payload, suggestions) };
    })
}));
