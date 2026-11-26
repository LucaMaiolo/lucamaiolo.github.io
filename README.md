# lucamaiolo.github.io

Personal portfolio of Luca Maiolo, a Computer Science student at John Abbott College in Montreal.

Live site: https://lucamaiolo.github.io

## The idea

The site is styled as **LM/OS**, a small retro operating system. The home screen tells the story with a scrolling USB stick, and the projects page is a DJ deck: each project lives on its own USB, and loading a stick into the deck shows that project's details on the screen and lifts them out as a hologram.

## Built with

- [Jekyll](https://jekyllrb.com/), the static site generator built into GitHub Pages
- [three.js](https://threejs.org/) for the 3D deck and USB sticks (glTF models, Meshopt-compressed)
- Plain HTML, CSS and JavaScript, no framework

## Structure

| Path | What it is |
| --- | --- |
| `_config.yml` | Jekyll site settings |
| `_layouts/default.html` | Page shell (head, meta tags, body) |
| `_includes/home-head.html` | Fonts and styles for the home page |
| `index.html` | The LM/OS home and projects page |
| `assets/models/` | 3D models for the deck and USB sticks |

## Run it locally

```bash
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.

## Deploying

GitHub Pages builds the site with Jekyll on every push to `main`.
