import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SecurityPage() {
  return (
    <main className="container section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Security</div>
          <h1>Resume data is sensitive by default.</h1>
          <p className="section-lead">The guest prototype has basic request and file checks, but it does not include production authentication, rate limiting, malware scanning, durable storage, or deletion workflows.</p>
        </div>
        <ShieldCheck size={42} color="var(--emerald)" />
      </div>
      <div className="grid grid-3">
        {["File type and size checks", "Server-side input validation", "No runtime database writes", "No external model calls", "Sanitized env template", "Advisory export checks"].map((item) => (
          <Card key={item}><h3>{item}</h3><p>Current portfolio-demo boundary.</p></Card>
        ))}
      </div>
    </main>
  );
}
