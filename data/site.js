// Everything the site says lives here, so content changes never touch the 3D code.

export const CONTACT = {
  email: 'lucamaiolo07@gmail.com',
  linkedin: 'https://www.linkedin.com/in/lucamaiolo',
  github: 'https://github.com/LucaMaiolo',
};

// One project per USB stick. `tag` is the short name used on labels and the crate list.
export const PROJECTS = [
  {
    id: 'jacpot', label: 'JACpot', tag: 'JACpot', kind: 'Student marketplace', color: '#f2a93b',
    stack: 'Kotlin', made: 'School project', year: '2026',
    what: 'A marketplace where John Abbott students buy and sell textbooks, calculators and other supplies to each other.',
    who: 'Students who want cheaper used materials, and students selling what they no longer need, without meeting strangers on Kijiji.',
    why: 'Finding cheap school supplies means jumping through a lot of hoops. This puts the whole school in one place.',
    links: [{ t: 'Open the repo', h: 'https://github.com/JACpot-Student-Marketplace/JACpot-Student-Marketplace', primary: true }],
  },
  {
    id: 'very-safe', label: 'very-very-very-safe-100-percent', tag: 'very-very-very-safe', short: 'very-very-\nvery-safe',
    kind: 'IP logger demo', color: '#ff5d63', stack: 'Web app on Vercel', made: 'School project', year: '2026',
    what: 'A security awareness demo. One click on an innocent-looking link shows you your IP address, rough location and browser.',
    who: 'Everyday people who click links without thinking, and anyone teaching basic online safety.',
    why: 'Built out of my interest in offensive security. It only logs visitors who open it on purpose, and explains how to protect yourself.',
    links: [
      { t: 'Open the repo', h: 'https://github.com/LucaMaiolo/very-very-very-safe-100-percent', primary: true },
      { t: 'Try the live demo', h: 'https://very-very-very-safe-100-percent.vercel.app' },
    ],
  },
  {
    id: 'jachl', label: 'JACHL', tag: 'JACHL', kind: 'Arcade hockey game', color: '#64cdf2',
    stack: 'JavaScript, Matter.js', made: 'Game Programming final', year: '2026',
    what: 'Top-down arcade hockey in the browser. Skate with the mouse, charge shots, pass to an AI teammate. First to 7 wins.',
    who: 'Anyone who wants a quick pick-up-and-play hockey match.',
    why: 'I built the shooting and passing system and the AI that switches between chase, attack and defend when possession changes.',
    links: [{ t: 'Repo goes public after Dec 17', h: null, primary: true }],
  },
];

// Bottom bar channels. Pages marked `soon` show the "no signal" screen for now.
export const CHANNELS = [
  { key: 'home', label: 'Index', href: '#' },
  { key: 'projects', label: 'Projects', href: '#projects' },
  { key: 'about', label: 'About', href: '#about', soon: 'About' },
  { key: 'hackathons', label: 'Hackathons', href: '#hackathons', soon: 'Hackathons' },
  { key: 'pitches', label: 'Pitches', href: '#pitches', soon: 'Pitch videos' },
  { key: 'beyond', label: 'Beyond code', href: '#beyond', soon: 'Beyond code' },
];

export const HOME_STATS = [
  ['Status', 'Class of 2027'],
  ['Base', 'Montreal, QC'],
  ['Focus', 'Web dev, security'],
  ['Off hours', 'Swim coach, JACMUN, DJ'],
];

// [text, result, highlight?]
export const BOOT_LINES = [
  ['Mounting usb_1', 'ok'], ['Reading jacpot.kt', 'ok'], ['Reading very-very-very-safe-100-percent', '100% safe'],
  ['Reading jachl.js', 'ok'], ['Checking hackathons', 'first one pending'], ['Warming up the deck', 'ok'], ['Loading Luca Maiolo', 'ready', true],
];

export const SCAN_LINES = [
  ['Mount /dev/usb', 'ok'], ['Found jacpot.kt', 'ok'], ['Found very-very-very-safe', '100% safe'],
  ['Found jachl.js', 'ok'], ['3 sticks ready', 'ok'], ['Waiting for load', 'now', true],
];
