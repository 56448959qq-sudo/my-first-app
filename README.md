# Forest Runner

A small horizontal forest-adventure game MVP built with plain HTML, CSS, and JavaScript.

## Run it

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Controls

- Move with `A`/`D` or the left/right arrow keys.
- Jump with `W`, the up arrow, or Space.
- On touch devices, use the on-screen buttons.

## File structure

- `index.html` contains the page and game canvas.
- `style.css` contains the layout, responsive styles, and overlay UI.
- `script.js` contains the game loop, level, collisions, mushroom enemies, acorns, nature
  background, camera, and input handling.