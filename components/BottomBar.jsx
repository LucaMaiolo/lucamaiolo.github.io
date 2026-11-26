import { CHANNELS } from '@/data/site';

export default function BottomBar() {
  return (
    <footer className="bar u">
      <nav aria-label="Main">
        {CHANNELS.map((c) => (
          <a key={c.key} href={c.href} data-view={c.key} data-scramble="">{c.label}</a>
        ))}
      </nav>
      <div className="right">
        <span className="clock" id="clock" aria-label="Montreal time">MTL --:--:--</span>
        <button type="button" className="ghost-btn reboot u" id="reboot" data-scramble="">Reboot</button>
        <button type="button" className="ping u" id="ping" data-scramble="">Ping me</button>
      </div>
    </footer>
  );
}
