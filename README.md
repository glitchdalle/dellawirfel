# della wirfel — portfolio

plain html / css / js. no build step, no libraries. open any file in a text editor and change it.

## where things live
- `style.css` — all styling. the variables at the very top (colors, font, spacing, accent red) restyle the whole site.
- `main.js` — all the motion (see below).
- `index.html`, `about.html`, `projects.html`, `contact.html` — the main pages.
- `projects/*.html` — one page per project.
- images, video and pdfs currently sit in the top folder of the repo. project pages point to them with `../filename`.

## common edits
- **hover image in the project list:** set `data-img="your-file.jpg"` on that project's `<li>` in `projects.html` / `index.html`.
- **add an image on a project page:** `<div class="media reveal"><img src="../your-file.jpg" alt=""></div>`
- **change a project's category:** edit `data-tags="design data"` on its `<li>` (data, product, design, brand, motion).
- **animate something on scroll:** add `class="reveal"` to it.
- **scroll-scrubbed frames:** see `projects/timeless.html`. list the frames as `<img>` tags inside `.scrub-frames`, in order.

## capitalization rule
everything is written lowercase on purpose, except the pronoun "I" and acronyms (FIT, CUNY, NYC, UPMC, AI, UI, SQL, HTML, CSS...). type them that way when you edit.

## motion (main.js)
- page titles rise in letter by letter
- a black panel wipes between pages
- red progress line at the top + "you are here" locator bottom-left (page / section / %)
- images lift into view and go from blurry to sharp, with a slight parallax
- remi's screens are a draggable filmstrip
- timeless' banner swaps through 14 hand-drawn frames as you scroll
