import Panel from './Panel';
import Stats from './Stats';
import Hologram from './Hologram';
import { PROJECTS } from '@/data/site';

// Projects: the DJ deck. Pick a USB from the crate (or click one on the table) to load it.
export default function ProjectsView() {
  return (
    <div className="view" id="projects" hidden>
      <div className="pv" />
      <Panel as="section" className="crate u" aria-label="USB crate">
        <p>Pick a USB, or click one on the table</p>
        <ul id="crateList">
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <button type="button" id={`pick-${p.id}`} data-pick={p.id} aria-pressed="false" style={{ '--c': p.color }} data-scramble="">
                <span className="d" aria-hidden="true" />
                <span>{p.tag}</span>
                <span className="st">Load</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <p className="pvhint u" id="pvhint">Pick a USB to load it</p>
      <header className="pvtitle u" id="pvtitle">
        <span className="dimtxt">CH 02</span>
        <h1 className="name">Projects</h1>
        <small>{PROJECTS.length} tracks on file</small>
      </header>

      <Panel as="section" className="deckstat u" id="deckstat" aria-label="Deck status">
        <h3>Deck status</h3>
        <Stats rows={[
          ['Deck', 'XDJ-XZ'],
          ['USB 1', 'Empty', 'dsSlot'],
          ['Type', '--', 'dsType'],
          ['Stack', '--', 'dsStack'],
          ['Year', '--', 'dsYear'],
          ['Elapsed', '00:00', 'dsTime'],
        ]} />
      </Panel>

      <Panel as="section" className="meter u" id="meter" aria-hidden="true">
        <h3>Output</h3>
        <div className="bars" id="bars">
          {Array.from({ length: 16 }, (_, i) => <i key={i} />)}
        </div>
        <div className="row"><span>L</span><span id="mtState">Standby</span><span>R</span></div>
      </Panel>

      <span className="sidelab l u" aria-hidden="true">Deck A / Load</span>
      <span className="sidelab r u" aria-hidden="true">Deck B / Cue</span>
      <Hologram />
    </div>
  );
}
