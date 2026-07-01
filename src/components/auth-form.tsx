import Link from "next/link";
import { Github, Mail } from "lucide-react";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" | "reset" | "verify" }) {
  const titles = {
    "sign-in": "Sign in to KindlyCV AI",
    "sign-up": "Create your KindlyCV AI account",
    reset: "Reset your password",
    verify: "Verify your email"
  };
  const cta = {
    "sign-in": "Sign in",
    "sign-up": "Create account",
    reset: "Send reset link",
    verify: "Resend verification"
  };

  return (
    <main className="container section" style={{ maxWidth: 620 }}>
      <div className="card card-pad">
        <div className="eyebrow">Demo auth mode</div>
        <h1>{titles[mode]}</h1>
        <p className="section-lead">Production auth is prepared for Auth.js, Clerk, or Supabase Auth. Guest demo works without an account.</p>
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" type="email" placeholder="you@example.com" />
        </div>
        {mode !== "reset" && mode !== "verify" ? (
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" type="password" placeholder="At least 8 characters" />
          </div>
        ) : null}
        <div className="row">
          <Link className="button button-primary" href="/dashboard">{cta[mode]}</Link>
          <Link className="button" href="/resumes/new">Continue as guest</Link>
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="button" type="button"><Github size={16} /> OAuth GitHub</button>
          <button className="button" type="button"><Mail size={16} /> OAuth Google</button>
        </div>
      </div>
    </main>
  );
}
