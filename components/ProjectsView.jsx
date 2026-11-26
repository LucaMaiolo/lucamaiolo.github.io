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
        <h1 className="name">Projects</h1>
      </header>

      <Panel as="section" className="deckstat u" id="deckstat" aria-label="Deck status">
        <h3>Now loaded</h3>
        <Stats rows={[
          ['Project', 'Nothing yet', 'dsSlot'],
          ['Context', '--', 'dsType'],
          ['Built with', '--', 'dsStack'],
          ['Year', '--', 'dsYear'],
        ]} />
      </Panel>

      <Hologram />
    </div>
  );
}
