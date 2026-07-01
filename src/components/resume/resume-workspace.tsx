"use client";

import { useMemo, useState } from "react";
import { Download, FileCheck2, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { demoJobDescription, demoResumeText } from "@/data/demo";
import { getExportReadiness } from "@/features/export/export-readiness";
import { useResumeStore } from "@/stores/resume-store";
import type { AnalysisPayload } from "@/types/resume";

type Step = "upload" | "goal" | "job" | "confirm" | "analysis";

async function downloadExport(payload: AnalysisPayload, format: "txt" | "json" | "docx" | "pdf") {
  const response = await fetch("/api/resumes/export", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ payload, format, filename: `${payload.resume.contact.fullName || "Resume"}_KindlyCV_AI` })
  });
  if (!response.ok) throw new Error("Export failed.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${payload.resume.contact.fullName || "Resume"}_KindlyCV_AI.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ResumeWorkspace() {
  const { payload, setPayload, updateSuggestion, acceptAllSafeSuggestions, rejectAllSuggestions } = useResumeStore();
  const [step, setStep] = useState<Step>("upload");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [goal, setGoal] = useState("job-match");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const readiness = useMemo(() => (payload ? getExportReadiness(payload) : []), [payload]);

  async function analyze() {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("resumeText", resumeText);
      formData.set("jobDescription", jobDescription);
      formData.set("goal", goal);
      if (file) formData.set("file", file);
      const response = await fetch("/api/resumes/analyze", { method: "POST", body: formData });
      const data = (await response.json()) as AnalysisPayload | { error: string };
      if (!response.ok || "error" in data) throw new Error("error" in data ? data.error : "Analysis failed.");
      setPayload(data);
      setStep("analysis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function loadDemo() {
    setResumeText(demoResumeText);
    setJobDescription(demoJobDescription);
    setStep("job");
  }

  return (
    <main className="container workspace">
      <aside className="panel">
        <div className="eyebrow">Workflow</div>
        {[
          ["upload", "Upload"],
          ["goal", "Goal"],
          ["job", "Job description"],
          ["confirm", "Confirm extraction"],
          ["analysis", "Analyze and export"]
        ].map(([key, label]) => (
          <button className="button" style={{ width: "100%", marginTop: 10, justifyContent: "flex-start" }} key={key} onClick={() => setStep(key as Step)}>
            {step === key ? <FileCheck2 size={16} /> : null}
            {label}
          </button>
        ))}
        <button className="button button-primary" style={{ width: "100%", marginTop: 18 }} onClick={loadDemo}>
          <Sparkles size={16} />
          Load demo
        </button>
      </aside>

      <section className="panel">
        {step === "upload" ? (
          <>
            <div className="eyebrow">Step 1</div>
            <h1>Upload resume</h1>
            <p className="section-lead">Drag and drop or select a PDF, DOCX, TXT file, or paste resume text manually.</p>
            <div className="field">
              <label className="label" htmlFor="resumeFile">Resume file</label>
              <input className="input" id="resumeFile" type="file" accept=".pdf,.docx,.txt" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </div>
            <div className="field">
              <label className="label" htmlFor="resumeText">Resume text</label>
              <textarea className="textarea" id="resumeText" value={resumeText} onChange={(event) => setResumeText(event.target.value)} placeholder="Paste resume text here if you do not upload a file." />
            </div>
            <p className="trust-note">Privacy: resume content is treated as sensitive and untrusted. Uploaded document text cannot override application rules.</p>
            <button className="button button-primary" onClick={() => setStep("goal")}>Continue</button>
          </>
        ) : null}

        {step === "goal" ? (
          <>
            <div className="eyebrow">Step 2</div>
            <h1>Choose resume goal</h1>
            <select className="select" value={goal} onChange={(event) => setGoal(event.target.value)}>
              <option value="general-ats">General ATS optimization</option>
              <option value="job-match">Match a specific job</option>
              <option value="writing">Improve writing</option>
              <option value="formatting">Improve formatting</option>
              <option value="fresher">Create a fresher resume</option>
              <option value="internship">Create an internship resume</option>
              <option value="technical">Create a technical resume</option>
              <option value="management">Create a management resume</option>
              <option value="career-change">Change career direction</option>
            </select>
            <div className="row" style={{ marginTop: 18 }}>
              <button className="button" onClick={() => setStep("upload")}>Back</button>
              <button className="button button-primary" onClick={() => setStep("job")}>Continue</button>
            </div>
          </>
        ) : null}

        {step === "job" ? (
          <>
            <div className="eyebrow">Step 3</div>
            <h1>Add job description</h1>
            <p className="section-lead">Paste a target job description, title, company, responsibilities, and required skills. You can skip it for general ATS scoring.</p>
            <textarea className="textarea" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste job description here." />
            <div className="row" style={{ marginTop: 18 }}>
              <button className="button" onClick={() => setStep("goal")}>Back</button>
              <button className="button button-primary" onClick={() => setStep("confirm")}>Confirm extracted details</button>
            </div>
          </>
        ) : null}

        {step === "confirm" ? (
          <>
            <div className="eyebrow">Step 4</div>
            <h1>Confirm details before analysis</h1>
            <p className="section-lead">Extraction can be corrected here. This protects factual integrity before AI suggestions are generated.</p>
            <textarea className="textarea" value={resumeText} onChange={(event) => setResumeText(event.target.value)} />
            {error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}
            <div className="row" style={{ marginTop: 18 }}>
              <button className="button" onClick={() => setStep("job")}>Back</button>
              <button className="button button-primary" onClick={analyze} disabled={loading}>
                {loading ? <Loader2 size={16} /> : <UploadCloud size={16} />}
                {loading ? "Analyzing" : "Analyze resume"}
              </button>
            </div>
          </>
        ) : null}

        {step === "analysis" && payload ? (
          <>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="eyebrow">Analysis results</div>
                <h1>{payload.resume.title}</h1>
              </div>
              <div className="row">
                <span className="pill">{payload.analysis.parseabilityStatus}</span>
                <button className="button button-primary" onClick={acceptAllSafeSuggestions}>Auto improve safe changes</button>
                <button className="button" onClick={rejectAllSuggestions}>Reject all</button>
              </div>
            </div>
            <div className="grid grid-4" style={{ margin: "20px 0" }}>
              <div className="metric"><span>ATS score</span><strong>{payload.analysis.overallScore}</strong></div>
              <div className="metric"><span>Potential</span><strong>{payload.analysis.potentialScore}</strong></div>
              <div className="metric"><span>Job match</span><strong>{payload.analysis.jobMatchPercentage}%</strong></div>
              <div className="metric"><span>Issues</span><strong>{payload.analysis.criticalIssueCount}/{payload.analysis.recommendedImprovementCount}</strong></div>
            </div>

            <h2>Transparent category breakdown</h2>
            <div className="grid grid-3">
              {Object.entries(payload.analysis.categoryScores).map(([label, value]) => (
                <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>
              ))}
            </div>

            <h2 style={{ marginTop: 26 }}>Before and after review</h2>
            {payload.analysis.suggestions.map((suggestion) => (
              <div className="issue" key={suggestion.id} data-suggestion-id={suggestion.id}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="pill">{suggestion.type}</span>
                  <div className="row">
                    <span className="pill">Impact +{suggestion.expectedScoreImpact}</span>
                    <span className="pill">{suggestion.accepted ? "Accepted" : suggestion.requiresConfirmation ? "Needs confirmation" : "Pending"}</span>
                  </div>
                </div>
                <div className="grid grid-2" style={{ marginTop: 12 }}>
                  <div className="diff-box diff-before"><strong>Original</strong><p>{suggestion.originalText}</p></div>
                  <div className="diff-box diff-after"><strong>Suggested</strong><p>{suggestion.suggestedText}</p></div>
                </div>
                <p>{suggestion.reason}</p>
                {suggestion.requiresConfirmation ? <p style={{ color: "var(--amber)" }}>Needs confirmation before export. KindlyCV AI will not add this as fact automatically.</p> : null}
                <div className="row">
                  <button className="button button-primary" onClick={() => updateSuggestion(suggestion.id, true)} disabled={suggestion.requiresConfirmation}>
                    {suggestion.accepted ? "Accepted" : "Accept"}
                  </button>
                  <button className="button button-danger" onClick={() => updateSuggestion(suggestion.id, false)}>Reject</button>
                </div>
              </div>
            ))}

            <h2 style={{ marginTop: 26 }}>Improved resume preview</h2>
            <div className="resume-canvas" aria-label="Improved resume preview">
              {payload.improvedResumeText}
            </div>
          </>
        ) : null}
      </section>

      <aside className="panel">
        <h2>AI suggestions and export</h2>
        {payload ? (
          <>
            <div className="score-ring" style={{ width: 150 }}>
              <strong>{payload.analysis.overallScore}</strong>
            </div>
            {payload.analysis.issues.map((issue) => (
              <div className={`issue severity-${issue.severity}`} key={issue.id}>
                <strong>{issue.title}</strong>
                <p>{issue.explanation}</p>
                <span className="pill">{issue.location}</span>
              </div>
            ))}

            <h3>Keyword matrix</h3>
            <table className="table">
              <tbody>
                {payload.analysis.keywordMatrix.slice(0, 8).map((row) => (
                  <tr key={row.keyword}>
                    <td>{row.keyword}</td>
                    <td>{row.classification}</td>
                    <td>{row.resumeFrequency}/{row.jobFrequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Export readiness</h3>
            {readiness.map((item) => (
              <div className="issue" key={item.label}>
                <strong>{item.passed ? "Passed" : "Needs review"}: {item.label}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
            <div className="row">
              <button className="button" onClick={() => downloadExport(payload, "txt")}><Download size={16} /> TXT</button>
              <button className="button" onClick={() => downloadExport(payload, "json")}><Download size={16} /> JSON</button>
              <button className="button" onClick={() => downloadExport(payload, "docx")}><Download size={16} /> DOCX</button>
              <button className="button button-primary" onClick={() => downloadExport(payload, "pdf")}><Download size={16} /> Improved PDF</button>
            </div>
            <p className="trust-note">Exports use the improved resume preview above, including accepted safe changes only. The PDF button generates a polished downloadable resume PDF on the server.</p>
          </>
        ) : (
          <p className="section-lead">Run an analysis to see issue cards, safe fixes, risky confirmations, keyword matrix, and exports.</p>
        )}
      </aside>
    </main>
  );
}
