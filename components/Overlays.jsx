// Full-screen effects: the red ink wipe after boot, the TV channel switch, and the CRT glass (vignette only: no scanlines).
export default function Overlays() {
  return (
    <>
      <canvas id="wipe" hidden aria-hidden="true" />
      <div id="tv" hidden aria-hidden="true">
        <div className="lid top" /><div className="lid bot" /><div className="ln" /><div className="lab" id="tvLabel" />
      </div>
      <div id="crt" aria-hidden="true"><div className="glass" /></div>
    </>
  );
}
