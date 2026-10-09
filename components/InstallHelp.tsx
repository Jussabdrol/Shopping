import { Icon } from "./Icon";

export function InstallHelp() {
  return (
    <details className="install-help">
      <summary>
        <Icon name="phone" width="17" height="17" /> Zet op je beginscherm
      </summary>
      <div className="install-help-body">
        <p>
          <strong>iPhone of iPad</strong>
          <br />
          Open deze app in Safari. Tik op Deel en kies ‘Zet op beginscherm’. Zo
          heb je je lijst altijd bij de hand.
        </p>
        <p>
          <strong>Android</strong>
          <br />
          Open het browsermenu en kies ‘Toevoegen aan startscherm’ of ‘App
          installeren’.
        </p>
      </div>
    </details>
  );
}
