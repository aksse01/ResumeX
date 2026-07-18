import { ArrowRight, CheckCircle2, FileText, LockKeyhole, Sparkles, Wand2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  "Transparent internal scoring",
  "Job-description skill matching",
  "Deterministic rewrite suggestions",
  "Keyword gap detection",
  "Action-verb improvements",
  "Plain-text formatting checks",
  "Section completeness checks",
  "Writing and readability signals",
  "Before-and-after review",
  "TXT, JSON, DOCX, and improved PDF export",
  "PDF, DOCX, and TXT extraction",
  "No external AI key required"
];

const faq = [
  ["Does ResumeX guarantee interviews?", "No. It improves clarity, keyword alignment, and ATS readability, but hiring decisions depend on many external factors."],
  ["Will it add unsupported skills?", "No. Missing job-description skills are flagged for confirmation and kept out of automatic rewrites."],
  ["Can I use it without an AI key?", "Yes. The current analysis uses deterministic rules and does not call an external model."],
  ["Is the score an external ATS score?", "No. It is a transparent internal rubric designed to explain strengths and weaknesses."]
];

export default function LandingPage() {
  return (
    <>
      <main className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">Build a resume that recruiters and ATS systems can understand.</div>
            <h1>Turn your resume into an ATS-ready job application.</h1>
            <p>
              Upload your resume, compare it with a job description, review an explainable score,
              and apply conservative wording suggestions before exporting a new draft.
            </p>
            <div className="hero-actions">
              <LinkButton href="/resumes/new" variant="primary">
                Analyze My Resume <ArrowRight size={18} />
              </LinkButton>
              <LinkButton href="/dashboard">View Demo</LinkButton>
            </div>
            <p className="trust-note">
              Automatic rewrites do not insert new skills or metrics. Missing skills are flagged for review.
            </p>
          </div>

          <div className="card score-preview">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="pill">Live preview</span>
              <span className="pill">88 internal score</span>
            </div>
            <div className="score-ring">
              <strong>88</strong>
            </div>
            <div className="diff">
              <div className="diff-box diff-before">
                <strong>Before</strong>
                <p>Worked on reports and data.</p>
              </div>
              <div className="diff-box diff-after">
                <strong>After</strong>
                <p>Contributed to reports and data.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Capabilities</div>
              <h2>Resume optimization without hidden tricks.</h2>
            </div>
            <p className="section-lead">No hidden keywords, no fake ATS promises, no unsupported claims.</p>
          </div>
          <div className="grid grid-4">
            {features.map((feature) => (
              <Card key={feature}>
                <CheckCircle2 color="var(--emerald)" />
                <h3>{feature}</h3>
              </Card>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="grid grid-4">
            {[
              ["Upload", "Add PDF, DOCX, or TXT resume content."],
              ["Analyze", "Get a transparent score and category deductions."],
              ["Improve", "Review factual suggestions before applying changes."],
              ["Export", "Download job-ready TXT, JSON, DOCX, or an improved PDF."]
            ].map(([title, copy], index) => (
              <Card key={title}>
                <span className="pill">Step {index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="section grid grid-2">
          <Card>
            <FileText color="var(--indigo)" />
            <h2>Review workspace</h2>
            <p className="section-lead">The workspace combines a resume preview, category scores, issue review, conservative wording edits, and advisory export checks.</p>
          </Card>
          <Card>
            <LockKeyhole color="var(--emerald)" />
            <h2>Clear demo boundaries</h2>
            <p className="section-lead">The guest flow does not write resumes to an application database, but it is not production-hardened. Do not upload sensitive real documents.</p>
          </Card>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Frequently asked questions</h2>
            <Sparkles color="var(--indigo)" />
          </div>
          <div className="grid grid-2">
            {faq.map(([question, answer]) => (
              <Card key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="section card card-pad">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Guest demo mode</span>
              <h2>Try the complete analysis journey now.</h2>
            </div>
            <LinkButton href="/resumes/new" variant="primary">
              <Wand2 size={18} />
              Start optimizing
            </LinkButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
