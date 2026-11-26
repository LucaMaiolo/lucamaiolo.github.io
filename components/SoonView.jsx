import Panel from './Panel';

// "No signal" screen for channels that are still being built.
export default function SoonView() {
  return (
    <div className="view" id="soon" hidden>
      <section className="chapter soonv gutter u">
        <Panel marked>
          <p className="dimtxt">No signal on this channel yet</p>
          <h1 className="name" id="soonTitle">About</h1>
          <p className="bio">This page is next on the build list.</p>
          <a className="load" href="#" data-scramble="">
            <span className="sq" aria-hidden="true" /><span>Back to index</span>
          </a>
        </Panel>
      </section>
    </div>
  );
}
