import { applicationRows } from "@/data/demo";
import { Card } from "@/components/ui/card";

const statuses = ["Saved", "Applied", "Assessment", "Interview", "Offer", "Rejected", "Withdrawn"];

export default function ApplicationsPage() {
  return (
    <main className="container section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Static preview</div>
          <h1>Application tracker concept.</h1>
          <p className="section-lead">This page demonstrates a possible tracker layout with sample data. Editing and persistence are not implemented.</p>
        </div>
      </div>
      <div className="grid grid-4">
        {statuses.slice(0, 4).map((status) => (
          <Card key={status}>
            <h3>{status}</h3>
            {applicationRows.filter((row) => row.status === status).map((row) => (
              <div className="issue" key={row.company}>
                <strong>{row.company}</strong>
                <p>{row.role}</p>
                <span className="pill">Resume score {row.score}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </main>
  );
}
