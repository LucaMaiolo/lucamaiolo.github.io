import { CHANNELS, CONTACT } from '@/data/site';

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
        <a className="ext" href={CONTACT.github} target="_blank" rel="noopener" data-scramble=""><span>GitHub</span></a>
        <a className="ext" href={CONTACT.linkedin} target="_blank" rel="noopener" data-scramble=""><span>LinkedIn</span></a>
        <button type="button" className="ghost-btn reboot u" id="reboot" data-scramble="">Reboot</button>
        <button type="button" className="ping u" id="ping" data-scramble="">Ping me</button>
      </div>
    </footer>
  );
}
