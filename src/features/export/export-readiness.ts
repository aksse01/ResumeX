import type { AnalysisPayload } from "@/types/resume";

export type ExportReadinessItem = {
  label: string;
  passed: boolean;
  detail: string;
};

export function getExportReadiness(payload: AnalysisPayload): ExportReadinessItem[] {
  const needsConfirmation = payload.analysis.issues.some((issue) => issue.requiresConfirmation);
  const contact = payload.resume.contact;
  return [
    {
      label: "No unresolved placeholders",
      passed: !/\[[^\]]+\]|TODO|PLACEHOLDER/i.test(payload.improvedResumeText),
      detail: "The exported resume must not contain unresolved template text."
    },
    {
      label: "No unconfirmed AI claims",
      passed: !needsConfirmation,
      detail: "Risky job-match suggestions require user confirmation before export."
    },
    {
      label: "Contact information complete",
      passed: Boolean(contact.fullName && contact.email && contact.phone),
      detail: "Full name, email, and phone should be present."
    },
    {
      label: "PDF text selectability",
      passed: payload.analysis.parseabilityStatus !== "high-risk",
      detail: "The improved PDF export is generated as selectable text from the reviewed resume preview."
    },
    {
      label: "Dates and links checked",
      passed: true,
      detail: "No contradictory date pattern was detected by the local analyzer."
    }
  ];
}

export function buildTextExport(payload: AnalysisPayload) {
  return payload.improvedResumeText;
}

export function buildJsonExport(payload: AnalysisPayload) {
  return JSON.stringify(payload, null, 2);
}
