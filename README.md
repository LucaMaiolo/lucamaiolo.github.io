# lucamaiolo.github.io

Personal portfolio of Luca Maiolo, a Computer Science student at John Abbott College in Montreal.

Live site: https://lucamaiolo.github.io

## The idea

The site is styled as **LM/OS**, a small retro operating system on a curved CRT screen. The home page tells the story with a scrolling USB stick that splits into three. The projects page is a DJ deck: each project lives on its own USB, and loading a stick plays it on the deck and lifts the project's details out as a hologram.

## Built with

- [Next.js](https://nextjs.org/) with static export (`output: 'export'`), so the whole site is plain HTML, CSS and JS that GitHub Pages can host
- React components for every part of the page, with all content kept in one data file
- [three.js](https://threejs.org/) for the 3D deck and USB sticks (glTF models, Meshopt-compressed)
- A GitHub Actions workflow that builds and deploys on every push to `main`

## How it's put together

| Path | What it is |
| --- | --- |
| `data/site.js` | All the content: projects, nav channels, boot and scan lines, contact |
| `app/layout.jsx` | Page shell, metadata, fonts |
| `app/page.jsx` | Puts the views together into one screen |
| `components/` | `HomeView`, `ProjectsView`, `Hologram`, `BottomBar`, `BootScreen` and the smaller pieces |
| `lib/lmos.js` | The runtime: 3D scenes, hash routing, boot loader, TV channel switch, CRT curve |
| `public/assets/models/` | 3D models for the deck and USB sticks |
| `.github/workflows/deploy.yml` | Builds the site and publishes it to GitHub Pages |

React renders every view as static HTML at build time, so the project details are in the page even before JavaScript runs. `lib/lmos.js` is loaded in the browser afterwards and wires the motion and 3D onto that HTML.

To add or change a project, edit `data/site.js`. The crate list, the USB stickers, the deck screen and the hologram card all read from it.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. `npm run build` writes the static site to `out/`.
