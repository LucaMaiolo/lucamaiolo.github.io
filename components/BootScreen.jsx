// The LM/OS loader shown on a visitor's first load of the session.
export default function BootScreen() {
  return (
    <div id="boot" role="status" aria-live="polite" hidden>
      <header className="u"><span>LM/OS 2026.11</span><span>Montreal node</span></header>
      <pre className="log u" id="log" />
      <footer>
        <span className="count" id="count">000</span>
        <span className="skip u">Click or press any key to skip</span>
      </footer>
      <div className="barline" id="barline" />
    </div>
  );
}
