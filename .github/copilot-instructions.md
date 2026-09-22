# Copilot instructions for Sky Runner

## Language

ユーザーへの説明や回答は日本語で表示してください。コード、識別子、コマンド、ファイル名は既存の表記を維持してください。

## Project shape

Sky Runner is a dependency-free browser game. The application is loaded directly from
`index.html`, which links `style.css` and `script.js`; there is no package manager,
bundler, server framework, or generated output.

The game is rendered in a fixed 960x540 HTML canvas and displayed responsively with CSS.
`script.js` owns the complete runtime:

- `level` is the static world definition (platforms, coin locations, and enemy patrol bounds).
- `game` is the mutable per-run state created by `newGame()`.
- `update()` applies input, gravity, movement, platform landing, collection, enemy collision,
  lives, camera tracking, and the win condition.
- `draw()` renders the sky, background, world objects, player, and finish flag in world
  coordinates after translating by `game.cameraX`.
- The `requestAnimationFrame` loop runs only while `game.running`.
- `index.html` provides the canvas, HUD, start/restart overlay, and touch buttons; `style.css`
  handles the responsive presentation but does not implement game behavior.

Keep the canvas's world-coordinate model intact when adding entities: define their world
positions in `level`, update them in `update()`, and render them inside the translated section
of `draw()`. Use the existing `overlaps()` helper for axis-aligned collision checks.

## Run, test, and lint

There are currently no build, test, or lint scripts and no automated test suite. Run the game
from the repository root by opening `index.html`, or serve it locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. For the available automated smoke check, validate JavaScript
syntax with:

```bash
node --check script.js
```

There is no single-test command because no test files or test runner exist. Browser changes
should be checked by starting a game, moving and jumping, collecting coins, colliding with
enemies, falling, restarting, and reaching the flag.

The repository includes a Playwright MCP server in `.vscode/mcp.json`. Use it for interactive
browser smoke checks when available; the game must first be served from the repository root
with `python3 -m http.server 8000`.

## Conventions specific to this repository

- Keep the three-file separation: structure and accessible labels in `index.html`, visual
  layout/theme/responsiveness in `style.css`, and game state/behavior in `script.js`.
- Use plain browser APIs and ES6-style JavaScript; do not introduce dependencies or a build
  step without updating the README and this file.
- Use the existing lower-camel-case DOM IDs and `data-key` values (`left`, `jump`, `right`)
  when wiring UI to the game.
- Keyboard controls are handled centrally through the `keys` object. Touch controls should
  update the same keys rather than adding a second movement implementation.
- Reset transient run state through `newGame()` and keep HUD updates going through
  `updateHud()`, so restart behavior and displayed score/lives stay synchronized.
- Preserve the canvas's 960x540 logical coordinate system; CSS scales the canvas for smaller
  screens. Responsive/mobile behavior belongs in CSS and the existing touch-control layer.
- Update the README when controls, local startup, or the file responsibilities change.
