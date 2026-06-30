import { clamp, uid, wordCount } from "@/lib/utils";
import type {
  AnalysisPayload,
  CategoryScores,
  KeywordMatrixRow,
  ResumeAnalysis,
  ResumeDocument,
  ResumeIssue,
  ResumeSuggestion
} from "@/types/resume";
import { findSkills } from "@/features/resumes/skill-taxonomy";

const maxScores: CategoryScores = {
  jobMatch: 25,
  experienceQuality: 20,
  parseability: 15,
  structure: 15,
  writing: 10,
  formatting: 10,
  contactDetails: 5
};

const weakPhrases = [
  "responsible for",
  "worked on",
  "helped with",
  "participated in",
  "involved in",
  "did ",
  "made ",
  "handled"
];

const actionVerbs = [
  "built",
  "created",
  "implemented",
  "optimized",
  "analyzed",
  "designed",
  "automated",
  "improved",
  "delivered",
  "developed",
  "collaborated",
  "supported",
  "contributed",
  "managed"
];

function countSkillCoverage(resumeText: string, jobDescription: string) {
  const resumeSkills = findSkills(resumeText);
  const jobSkills = findSkills(jobDescription);
  const matched = resumeSkills.filter((skill) => jobSkills.includes(skill));
  const missing = jobSkills.filter((skill) => !resumeSkills.includes(skill));
  const coverage = jobSkills.length === 0 ? 100 : Math.round((matched.length / jobSkills.length) * 100);
  return { resumeSkills, jobSkills, matched, missing, coverage };
}

function textFrequency(text: string, keyword: string) {
  const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(`\\b${safe}\\b`, "gi")) ?? []).length;
}

function keywordMatrix(resume: ResumeDocument, jobDescription: string): KeywordMatrixRow[] {
  const { jobSkills, resumeSkills } = countSkillCoverage(resume.originalText, jobDescription);
  const resumeLower = resume.originalText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  return jobSkills.map((keyword) => {
    const resumeFrequency = textFrequency(resumeLower, keyword);
    const jobFrequency = textFrequency(jobLower, keyword);
    const sections: string[] = [];
    if (resume.summary?.toLowerCase().includes(keyword)) sections.push("Summary");
    if (resume.skills.some((group) => group.skills.includes(keyword))) sections.push("Skills");
    if (resume.experience.some((entry) => entry.bullets.some((bullet) => bullet.currentText.toLowerCase().includes(keyword)))) {
      sections.push("Experience");
    }
    if (resume.projects.some((entry) => entry.technologies.includes(keyword) || entry.bullets.some((bullet) => bullet.currentText.toLowerCase().includes(keyword)))) {
      sections.push("Projects");
    }

    const present = resumeSkills.includes(keyword);
    const classification: KeywordMatrixRow["classification"] = present
      ? resumeFrequency > 4
        ? "overused"
        : sections.length > 1
          ? "present-strong"
          : "present-weak"
      : "missing-needs-confirmation";

    return {
      keyword,
      importance: jobFrequency > 1 ? "required" : "preferred",
      jobFrequency: Math.max(1, jobFrequency),
      resumeFrequency,
      sections,
      classification,
      recommendation: present
        ? "Keep this keyword in a natural context with evidence."
        : "Add only if this skill is truthful and can be supported by your experience.",
      verified: present
    };
  });
}

function sectionPresenceScore(resume: ResumeDocument) {
  const checks = [
    Boolean(resume.contact.fullName),
    Boolean(resume.summary),
    resume.skills.length > 0,
    resume.experience.some((entry) => entry.bullets.length > 0),
    resume.projects.some((entry) => entry.bullets.length > 0),
    resume.education.length > 0
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * maxScores.structure);
}

function contactScore(resume: ResumeDocument) {
  let score = 0;
  if (resume.contact.fullName) score += 1;
  if (resume.contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.contact.email)) score += 1.5;
  if (resume.contact.phone) score += 1;
  if (resume.contact.linkedin) score += 0.75;
  if (resume.contact.github || resume.contact.portfolio) score += 0.75;
  return clamp(score, 0, maxScores.contactDetails);
}

function experienceQuality(resume: ResumeDocument) {
  const bullets = [...resume.experience.flatMap((entry) => entry.bullets), ...resume.projects.flatMap((entry) => entry.bullets)];
  if (bullets.length === 0) return 4;
  const metricCount = bullets.filter((bullet) => bullet.detectedMetrics.length > 0).length;
  const actionCount = bullets.filter((bullet) => actionVerbs.some((verb) => bullet.currentText.toLowerCase().startsWith(verb))).length;
  const weakCount = bullets.filter((bullet) => weakPhrases.some((phrase) => bullet.currentText.toLowerCase().includes(phrase))).length;
  const raw = 8 + metricCount * 2 + actionCount * 1.5 - weakCount * 2;
  return clamp(Math.round(raw), 0, maxScores.experienceQuality);
}

function parseabilityScore(resumeText: string) {
  let score = maxScores.parseability;
  if (/\(cid:\d+\)/i.test(resumeText)) score -= 4;
  if (/[^\x00-\x7F]/.test(resumeText)) score -= 1;
  if (/\t{2,}/.test(resumeText)) score -= 2;
  if (/table|columns|text box/i.test(resumeText)) score -= 1;
  return clamp(score, 0, maxScores.parseability);
}

function writingScore(resumeText: string) {
  let score = maxScores.writing;
  for (const phrase of weakPhrases) {
    if (resumeText.toLowerCase().includes(phrase)) score -= 1;
  }
  if (/\bi\b/i.test(resumeText)) score -= 1;
  if (resumeText.split(/\n/).some((line) => line.length > 180)) score -= 1;
  return clamp(score, 0, maxScores.writing);
}

function formattingScore(resumeText: string) {
  let score = maxScores.formatting;
  const lines = resumeText.split(/\n/);
  if (lines.some((line) => line.length > 140)) score -= 2;
  if ((resumeText.match(/[|]/g) ?? []).length > 16) score -= 1;
  if ((resumeText.match(/\n\s*\n/g) ?? []).length < 2) score -= 1;
  return clamp(score, 0, maxScores.formatting);
}

function makeIssue(params: Omit<ResumeIssue, "id" | "claimStatus"> & { claimStatus?: ResumeIssue["claimStatus"] }): ResumeIssue {
  return {
    id: uid("issue"),
    claimStatus: params.claimStatus ?? "verified-from-resume",
    ...params
  };
}

function buildIssues(resume: ResumeDocument, missingSkills: string[], categoryScores: CategoryScores): ResumeIssue[] {
  const issues: ResumeIssue[] = [];

  if (missingSkills.length > 0) {
    issues.push(
      makeIssue({
        category: "Job match",
        severity: missingSkills.length > 3 ? "high" : "medium",
        title: "Target job keywords are missing",
        explanation: "Recruiters and ATS systems look for role-specific terminology. Add only truthful skills with evidence.",
        location: "Skills and relevant bullets",
        suggestedText: `Confirm whether these apply: ${missingSkills.slice(0, 8).join(", ")}`,
        expectedScoreImpact: Math.min(10, missingSkills.length * 2),
        confidence: 0.88,
        requiresConfirmation: true,
        claimStatus: "needs-confirmation"
      })
    );
  }

  if (categoryScores.experienceQuality < 14) {
    issues.push(
      makeIssue({
        category: "Experience",
        severity: "high",
        title: "Bullets need stronger action and outcome framing",
        explanation: "Strong bullets use action, task, tool or method, and outcome. Metrics must be supplied by the user.",
        location: "Experience and projects",
        expectedScoreImpact: 8,
        confidence: 0.82,
        requiresConfirmation: false
      })
    );
  }

  if (categoryScores.parseability < 12) {
    issues.push(
      makeIssue({
        category: "ATS parseability",
        severity: "critical",
        title: "Potential ATS parsing risk detected",
        explanation: "Unusual glyphs, tables, or complex layouts can prevent ATS systems from reading important text.",
        location: "Document formatting",
        expectedScoreImpact: 7,
        confidence: 0.78,
        requiresConfirmation: false
      })
    );
  }

  if (categoryScores.contactDetails < 4) {
    issues.push(
      makeIssue({
        category: "Contact",
        severity: "medium",
        title: "Contact details are incomplete",
        explanation: "A recruiter should be able to identify and contact the candidate quickly.",
        location: "Header",
        expectedScoreImpact: 3,
        confidence: 0.91,
        requiresConfirmation: true,
        claimStatus: "needs-confirmation"
      })
    );
  }

  if (!resume.summary) {
    issues.push(
      makeIssue({
        category: "Summary",
        severity: "medium",
        title: "Professional summary is missing",
        explanation: "A concise targeted summary helps recruiters understand fit within seconds.",
        location: "Top of resume",
        suggestedText: "Add a 40 to 80 word summary using only verified skills and experience.",
        expectedScoreImpact: 4,
        confidence: 0.86,
        requiresConfirmation: false
      })
    );
  }

  return issues;
}

function improveBullet(text: string) {
  let improved = text.trim().replace(/^[-*]\s*/, "");
  improved = improved.replace(/^worked on/i, "Contributed to");
  improved = improved.replace(/^responsible for/i, "Managed");
  improved = improved.replace(/^helped with/i, "Supported");
  improved = improved.replace(/^made/i, "Created");
  improved = improved.replace(/^did/i, "Completed");
  if (!actionVerbs.some((verb) => improved.toLowerCase().startsWith(verb)) && !/^(managed|supported|contributed)/i.test(improved)) {
    improved = `Delivered ${improved.charAt(0).toLowerCase()}${improved.slice(1)}`;
  }
  return improved.replace(/\s+/g, " ");
}

function buildSuggestions(resume: ResumeDocument, missingSkills: string[]): ResumeSuggestion[] {
  const bullets = [...resume.experience.flatMap((entry) => entry.bullets), ...resume.projects.flatMap((entry) => entry.bullets)];
  const suggestions: ResumeSuggestion[] = bullets.slice(0, 8).map((bullet) => {
    const suggestedText = improveBullet(bullet.currentText);
    return {
      id: uid("suggestion"),
      type: bullet.detectedMetrics.length > 0 ? "impact" : "ats",
      originalText: bullet.currentText,
      suggestedText,
      reason: "Strengthens action verb, concision, and ATS readability without adding new facts.",
      expectedScoreImpact: suggestedText === bullet.currentText ? 0.5 : 2,
      confidence: 0.84,
      factualRisk: "low",
      requiresConfirmation: false,
      accepted: false
    };
  });

  if (missingSkills.length > 0) {
    suggestions.push({
      id: uid("suggestion"),
      type: "job-match",
      originalText: "Skills section",
      suggestedText: `Ask user to confirm these job keywords before adding: ${missingSkills.slice(0, 8).join(", ")}`,
      reason: "ResumeForge AI does not insert unsupported skills.",
      expectedScoreImpact: Math.min(8, missingSkills.length * 1.5),
      confidence: 0.9,
      factualRisk: "high",
      requiresConfirmation: true,
      accepted: false
    });
  }

  return suggestions;
}

export function buildImprovedResumeText(originalText: string, suggestions: ResumeSuggestion[]) {
  const safe = suggestions.filter((suggestion) => suggestion.accepted && !suggestion.requiresConfirmation);
  let text = originalText;
  for (const suggestion of safe) {
    if (suggestion.originalText && suggestion.suggestedText && text.includes(suggestion.originalText)) {
      text = text.replace(suggestion.originalText, suggestion.suggestedText);
    }
  }
  return text;
}

export function analyzeResume(resume: ResumeDocument, jobDescription = ""): AnalysisPayload {
  const skillStats = countSkillCoverage(resume.originalText, jobDescription);
  const categoryScores: CategoryScores = {
    jobMatch: jobDescription ? Math.round((skillStats.coverage / 100) * maxScores.jobMatch) : 18,
    experienceQuality: experienceQuality(resume),
    parseability: parseabilityScore(resume.originalText),
    structure: sectionPresenceScore(resume),
    writing: writingScore(resume.originalText),
    formatting: formattingScore(resume.originalText),
    contactDetails: contactScore(resume)
  };

  const overallScore = Math.round(Object.values(categoryScores).reduce((sum, score) => sum + score, 0));
  const matrix = keywordMatrix(resume, jobDescription);
  const issues = buildIssues(resume, skillStats.missing, categoryScores);
  const suggestions = buildSuggestions(resume, skillStats.missing);
  const autoFixImpact = suggestions.filter((suggestion) => !suggestion.requiresConfirmation).reduce((sum, suggestion) => sum + suggestion.expectedScoreImpact, 0);
  const potentialScore = clamp(Math.round(overallScore + autoFixImpact + issues.filter((issue) => issue.requiresConfirmation).length * 2), 0, 100);
  const optimizedScore = clamp(Math.round(overallScore + autoFixImpact), 0, potentialScore);
  const words = wordCount(resume.originalText);
  const improvedResumeText = buildImprovedResumeText(resume.originalText, suggestions);

  const analysis: ResumeAnalysis = {
    overallScore,
    potentialScore,
    optimizedScore,
    confidence: 0.86,
    categoryScores,
    scoreReasons: [
      `Job match contributed ${categoryScores.jobMatch}/25 points.`,
      `Experience quality contributed ${categoryScores.experienceQuality}/20 points.`,
      `ATS parseability contributed ${categoryScores.parseability}/15 points.`,
      "Scores are internal estimates and do not guarantee interviews or external ATS outcomes."
    ],
    issues,
    suggestions,
    keywordMatrix: matrix,
    jobMatchPercentage: jobDescription ? skillStats.coverage : 72,
    keywordCoveragePercentage: skillStats.jobSkills.length === 0 ? 72 : skillStats.coverage,
    parseabilityStatus: categoryScores.parseability >= 14 ? "excellent" : categoryScores.parseability >= 11 ? "good" : categoryScores.parseability >= 8 ? "needs-review" : "high-risk",
    recruiterReadabilityScore: clamp(Math.round((categoryScores.writing + categoryScores.formatting + categoryScores.structure) * 2.85), 0, 100),
    wordCount: words,
    estimatedReadingTimeMinutes: Math.max(1, Math.ceil(words / 220)),
    criticalIssueCount: issues.filter((issue) => issue.severity === "critical").length,
    recommendedImprovementCount: issues.length + suggestions.length,
    autoFixableIssueCount: suggestions.filter((suggestion) => !suggestion.requiresConfirmation).length,
    stopReason: potentialScore >= 95 ? "Target score reached under the internal rubric." : "Further improvement requires user-confirmed facts or job-specific context."
  };

  return {
    resume,
    analysis,
    improvedResumeText,
    versions: [
      { id: "original", label: "Original upload", score: overallScore, createdAt: resume.createdAt },
      { id: "optimized", label: "Auto optimized draft", score: optimizedScore, createdAt: new Date().toISOString() }
    ]
  };
}

export function applySafeSuggestions(payload: AnalysisPayload): AnalysisPayload {
  const safeSuggestions = payload.analysis.suggestions.map((suggestion) => ({
    ...suggestion,
    accepted: !suggestion.requiresConfirmation
  }));
  const acceptedImpact = safeSuggestions
    .filter((suggestion) => suggestion.accepted && !suggestion.requiresConfirmation)
    .reduce((sum, suggestion) => sum + suggestion.expectedScoreImpact, 0);
  const originalScore = payload.versions.find((version) => version.id === "original")?.score ?? payload.analysis.overallScore;
  return {
    ...payload,
    improvedResumeText: buildImprovedResumeText(payload.resume.originalText, safeSuggestions),
    analysis: {
      ...payload.analysis,
      overallScore: clamp(Math.round(originalScore + acceptedImpact), 0, payload.analysis.potentialScore),
      suggestions: safeSuggestions
    }
  };
}
