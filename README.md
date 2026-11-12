# della wirfel — portfolio

plain html / css / js. no build step, no libraries. open any file in a text editor and change it.

## where things live
- `style.css` — all styling. the variables at the very top (colors, font, spacing, accent red) restyle the whole site.
  - to allow capital letters, delete `text-transform: lowercase;` in `body`.
- `main.js` — the motion: giant name shrinking into the header, fade-ups on scroll, project filter, cursor image.
- `index.html`, `about.html`, `projects.html`, `contact.html` — the main pages.
- `projects/*.html` — one page per project.
- `images/` — put your images here.

## common edits
- **add a project image to the list hover:** in `projects.html` (and `index.html`), set `data-img="images/remi.jpg"` on that project's `<li>`.
- **add an image on a project page:** replace `main image` inside `<div class="c1-12 img-box">` with `<img src="../images/remi-1.jpg" alt="">`.
- **change a project's category:** edit `data-tags="design data"` on its `<li>` (design, data, advertising).
- **animate something on scroll:** add `class="reveal"` to it.
- **add a new project:** copy any file in `projects/`, rename it, then add a matching `<li>` in `projects.html`.
