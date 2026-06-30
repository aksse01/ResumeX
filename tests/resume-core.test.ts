import { describe, expect, it } from "vitest";
import { analyzeResume, applySafeSuggestions } from "@/features/analysis/scoring";
import { getExportReadiness } from "@/features/export/export-readiness";
import { parseResumeText } from "@/features/resumes/parser";
import { findSkills, normalizeSkillName } from "@/features/resumes/skill-taxonomy";
import { demoJobDescription, demoResumeText } from "@/data/demo";

describe("ResumeForge AI core workflow", () => {
  it("normalizes common skill aliases", () => {
    expect(normalizeSkillName("React.js")).toBe("react");
    expect(normalizeSkillName("PowerBI")).toBe("power bi");
    expect(findSkills("Built React.js dashboards with PowerBI, SQL, and problem-solving.")).toContain("react");
    expect(findSkills("Built React.js dashboards with PowerBI, SQL, and problem-solving.")).toContain("problem solving");
  });

  it("parses resume sections into a normalized document", () => {
    const resume = parseResumeText(demoResumeText);
    expect(resume.contact.email).toBe("alex.morgan@example.com");
    expect(resume.skills.length).toBeGreaterThan(0);
    expect(resume.projects[0]?.bullets.length).toBeGreaterThan(0);
    expect(resume.education.length).toBe(1);
  });

  it("calculates a transparent score and keyword matrix", () => {
    const resume = parseResumeText(demoResumeText);
    const payload = analyzeResume(resume, demoJobDescription);
    expect(payload.analysis.overallScore).toBeGreaterThan(60);
    expect(payload.analysis.categoryScores.jobMatch).toBeLessThanOrEqual(25);
    expect(payload.analysis.keywordMatrix.length).toBeGreaterThan(0);
    expect(payload.analysis.scoreReasons.join(" ")).toContain("not guarantee");
  });

  it("requires confirmation for unsupported missing skills", () => {
    const resume = parseResumeText("Jane Doe\njane@example.com\nSkills\nPython\nExperience\n- Built scripts.");
    const payload = analyzeResume(resume, "React AWS Kubernetes leadership required.");
    const risky = payload.analysis.suggestions.filter((suggestion) => suggestion.requiresConfirmation);
    expect(risky.length).toBeGreaterThan(0);
    expect(risky.every((suggestion) => suggestion.factualRisk === "high")).toBe(true);
  });

  it("checks export readiness", () => {
    const payload = analyzeResume(parseResumeText(demoResumeText), demoJobDescription);
    const readiness = getExportReadiness(payload);
    expect(readiness.some((item) => item.label === "No unresolved placeholders")).toBe(true);
  });

  it("applies accepted safe suggestions to the improved resume and score", () => {
    const payload = analyzeResume(parseResumeText(demoResumeText), demoJobDescription);
    expect(payload.improvedResumeText).toContain("Worked on responsive pages");

    const improved = applySafeSuggestions(payload);

    expect(improved.improvedResumeText).toContain("Contributed to responsive pages");
    expect(improved.analysis.overallScore).toBeGreaterThanOrEqual(payload.analysis.overallScore);
    expect(improved.analysis.suggestions.some((suggestion) => suggestion.accepted)).toBe(true);
  });
});
