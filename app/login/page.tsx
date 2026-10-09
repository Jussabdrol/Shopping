"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { BrandMark } from "@/components/Icon";
import { InstallHelp } from "@/components/InstallHelp";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="login-submit" disabled={pending}>
      {pending ? "Even geduld…" : "Inloggen"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <main className="login-page">
      <div className="login-card">
        <BrandMark />
        <div className="eyebrow">Je week, goed geregeld</div>
        <h1>Slim Boodschappen</h1>
        <p>
          Voer het wachtwoord in om je weekmenu en boodschappenlijst te openen.
        </p>
        <form className="login-form" action={formAction}>
          <label htmlFor="password">Wachtwoord</label>
          <input
            className="add-input"
            type="password"
            name="password"
            id="password"
            placeholder="Wachtwoord"
            required
            autoComplete="current-password"
          />
          <SubmitButton />
        </form>
        {state.error && (
          <div className="login-error" role="alert">
            {state.error}
          </div>
        )}
      </div>
      <InstallHelp />
    </main>
  );
}
