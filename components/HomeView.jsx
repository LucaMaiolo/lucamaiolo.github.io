import Panel from './Panel';
import Stats from './Stats';
import { HOME_STATS, PROJECTS } from '@/data/site';

const plain = { textTransform: 'none', letterSpacing: 0 };

// Home: a scroll story. One USB stick spins, the other two slide out, then "Load projects".
// The scan log and stats stay pinned for the whole story, so they live in the same section as the button.
export default function HomeView() {
  return (
    <div className="view" id="home">
      <section className="chapter ch1 gutter u">
        <Panel className="tl">
          <h1 className="name" style={{ textTransform: 'none' }}>Luca<br />Maiolo</h1>
          <p className="bio" style={plain}>
            Computer Science student at John Abbott College in Montreal. I build web apps and study how they get broken into.
          </p>
          <div className="readout" aria-hidden="true">
            <span className="tag"><b>X</b><span id="mx">0000</span></span>
            <span className="tag"><b>Y</b><span id="my">0000</span></span>
          </div>
        </Panel>
        <Panel as="nav" className="tr quick" aria-label="Projects">
          <p className="dimtxt">Jump to a project</p>
          <ul>
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <a href={`#${p.id}`} data-scramble="" style={{ '--c': p.color }}>
                  <span className="d" aria-hidden="true" />
                  <span>{p.tag}</span>
                  <span className="st">{p.kind}</span>
                </a>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="ml" aria-hidden="true">45.4065° N</div>
        <div className="mr" aria-hidden="true">73.9496° W</div>
        <Panel className="bl">
          <Stats rows={HOME_STATS} />
        </Panel>
        <div className="br"><span className="scrollcue">Scroll<i aria-hidden="true" /></span></div>
      </section>

      <section className="chapter ch2 gutter u">
        <Panel className="scanlog">
          <pre id="scanlog" aria-live="off" />
        </Panel>
        <Panel>
          <Stats rows={[
            ['Sticks found', '1', 'found'],
            ['Format', 'One project per USB'],
            ['Hackathons', 'First one coming up'],
          ]} />
        </Panel>
        <div className="cta">
          <p>{PROJECTS.length} projects on file</p>
          <button type="button" className="load" id="loadBtn" data-scramble="">
            <span className="sq" aria-hidden="true" /><span>Load projects</span>
          </button>
        </div>
      </section>
    </div>
  );
}
