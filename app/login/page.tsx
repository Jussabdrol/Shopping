"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/app/actions/auth";

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
    <div className="login-card">
      <h1>Slim Boodschappen</h1>
      <p>Voer het wachtwoord in om je weekmenu en boodschappenlijst te openen.</p>
      <form className="login-form" action={formAction}>
        <input
          className="add-input"
          type="password"
          name="password"
          placeholder="Wachtwoord"
          required
          autoComplete="current-password"
          autoFocus
        />
        <SubmitButton />
      </form>
      {state.error && <div className="login-error">{state.error}</div>}
    </div>
  );
}
