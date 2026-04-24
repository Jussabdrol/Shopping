"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { configured } = getSupabaseEnv();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Er ging iets mis.";
      setErrorMsg(msg);
      setStatus("error");
    }
  }

  if (!configured) {
    return (
      <div className="login-card">
        <h1>Slim Boodschappen</h1>
        <p>
          Supabase is nog niet geconfigureerd. Stel{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> en{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in om in te loggen.
        </p>
      </div>
    );
  }

  return (
    <div className="login-card">
      <h1>Slim Boodschappen</h1>
      <p>Log in met je e-mail om je weekmenu en boodschappenlijst op te slaan.</p>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="add-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="naam@voorbeeld.nl"
          required
          autoComplete="email"
        />
        <button
          type="submit"
          className="login-submit"
          disabled={status === "sending" || status === "sent"}
        >
          {status === "sending" ? "Even geduld…" : "Stuur inloglink"}
        </button>
      </form>
      {status === "sent" && (
        <div className="login-message">
          Check je inbox — we hebben je een inloglink gestuurd.
        </div>
      )}
      {status === "error" && errorMsg && (
        <div className="login-error">{errorMsg}</div>
      )}
    </div>
  );
}
