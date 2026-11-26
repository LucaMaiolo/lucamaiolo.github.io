import { PROJECTS } from '@/data/site';

// The project card that lifts off the deck screen. Every project's card is in the HTML
// (so the details are readable without JavaScript and by search engines); the runtime shows
// the one whose USB is loaded and warps it from the screen into place.
export default function Hologram() {
  return (
    <article className="holo u" id="holo" aria-live="polite">
      {PROJECTS.map((p, i) => (
        <div key={p.id} data-project={p.id} hidden>
          <div className="meta"><span>USB {i + 1} / {p.kind}</span><span>{p.year}</span></div>
          <h2 style={{ textTransform: 'none' }}>{p.label}</h2>
          <dl>
            <dt>What</dt><dd>{p.what}</dd>
            <dt>For</dt><dd>{p.who}</dd>
            <dt>Why</dt><dd>{p.why}</dd>
            <dt>Stack</dt><dd>{p.stack}</dd>
            <dt>Pitch</dt><dd><span className="ph">[60 to 90 second pitch video goes here]</span></dd>
          </dl>
          <div className="actions">
            {p.links.map((l) =>
              l.h ? (
                <a key={l.t} className={`hbtn ${l.primary ? 'primary' : ''}`} href={l.h} target="_blank" rel="noopener" data-scramble="">
                  <span>{l.t}</span>
                </a>
              ) : (
                <span key={l.t} className="hbtn soon" aria-disabled="true">{l.t}</span>
              )
            )}
            <button type="button" className="hbtn" data-eject="" data-scramble=""><span>Eject USB</span></button>
          </div>
        </div>
      ))}
    </article>
  );
}
