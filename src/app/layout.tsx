import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeX",
  description: "Build a resume that recruiters and ATS systems can understand."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="nav">
            <div className="container nav-inner">
              <Link className="brand" href="/">
                <span className="brand-mark" aria-hidden="true">
                  <FileText size={20} />
                </span>
                <span>ResumeX</span>
              </Link>
              <nav className="nav-links" aria-label="Main navigation">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/resumes/new">Analyze</Link>
                <Link href="/applications">Applications</Link>
                <Link href="/security">Security</Link>
                <Link className="button button-primary" href="/resumes/new">
                  <ShieldCheck size={16} />
                  Guest demo
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
