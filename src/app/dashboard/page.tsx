import Link from "next/link";
import { BarChart3, Clock, FilePlus2, Search } from "lucide-react";
import { applicationRows } from "@/data/demo";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

const resumes = [
  { title: "Data Analyst Resume", score: 91, match: 88, status: "Optimized", versions: 4, edited: "Today" },
  { title: "Software Developer Internship", score: 84, match: 79, status: "Draft", versions: 2, edited: "Yesterday" },
  { title: "Fresher Technical Resume", score: 76, match: 72, status: "Needs review", versions: 1, edited: "Jun 26" }
];

export default function DashboardPage() {
  return (
    <main className="container section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>Welcome back to KindlyCV AI.</h1>
          <p className="section-lead">Track resume readiness, job-match progress, versions, exports, and applications.</p>
        </div>
        <LinkButton href="/resumes/new" variant="primary">
          <FilePlus2 size={18} />
          New Resume Analysis
        </LinkButton>
      </div>

      <div className="grid grid-4">
        {[
          ["Active resumes", "3"],
          ["Average score", "84"],
          ["Exports", "7"],
          ["Open applications", "5"]
        ].map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="section">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            {["All resumes", "Drafts", "Optimized", "Exported", "Archived"].map((filter) => (
              <span className="pill" key={filter}>{filter}</span>
            ))}
          </div>
          <div className="pill"><Search size={14} /> Search and sort ready</div>
        </div>
        <div className="grid" style={{ marginTop: 18 }}>
          {resumes.map((resume) => (
            <Card key={resume.title}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <h3>{resume.title}</h3>
                  <p>{resume.status} | {resume.versions} versions | Last edited {resume.edited}</p>
                </div>
                <div className="row">
                  <span className="pill">ATS {resume.score}</span>
                  <span className="pill">Match {resume.match}%</span>
                  <Link className="button" href="/resumes/new">Open</Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-2">
        <Card>
          <BarChart3 color="var(--indigo)" />
          <h2>Improvement progress</h2>
          <p className="section-lead">Score history and issue-category analytics are wired in the product model and ready for database persistence.</p>
        </Card>
        <Card>
          <Clock color="var(--emerald)" />
          <h2>Application tracker summary</h2>
          <table className="table">
            <tbody>
              {applicationRows.map((row) => (
                <tr key={row.company}>
                  <td>{row.company}</td>
                  <td>{row.role}</td>
                  <td><span className="pill">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </main>
  );
}
