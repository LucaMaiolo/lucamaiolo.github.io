import CrtFilter from '@/components/CrtFilter';
import HomeView from '@/components/HomeView';
import ProjectsView from '@/components/ProjectsView';
import SoonView from '@/components/SoonView';
import BottomBar from '@/components/BottomBar';
import BootScreen from '@/components/BootScreen';
import Overlays from '@/components/Overlays';
import LmosRuntime from '@/components/LmosRuntime';
import { PROJECTS } from '@/data/site';

// The whole site is one "screen": every view is rendered here as static HTML at build time,
// and LmosRuntime brings it to life in the browser (3D scenes, routing, CRT effects).
export default function Page() {
  return (
    <>
      <CrtFilter />
      <div id="screen">
        <canvas id="scene" aria-hidden="true" />
        <div className="grid" aria-hidden="true" />
        <div id="scroller" tabIndex={-1}>
          <HomeView />
          <div className="locks" id="locks" aria-hidden="true">
            {PROJECTS.map((p) => (
              <div className="lock u" key={p.id} data-lock={p.id}>
                <div className="box" />
                <b>{p.tag}</b>
                <span>{p.kind}</span>
              </div>
            ))}
          </div>
          <ProjectsView />
          <SoonView />
        </div>
        <BottomBar />
        <div className="toast u" id="toast" hidden />
        <div id="xh" hidden aria-hidden="true">
          <svg><path className="v" /><path className="h" /></svg>
          <i className="p" />
          <span className="t" />
        </div>
      </div>
      <BootScreen />
      <Overlays />
      <LmosRuntime />
    </>
  );
}
