# City Drive 3D — Steering Lab

An original small driving prototype focused on steering feel. This is a **preview build**, not a finished commercial-quality driving game. No Pages deployment is configured; review and tune before publishing.

## Try it

Open `preview.html` in a current browser. This generated single-file version contains all code and styles, works offline, and requires no assets, installation or server. Some mobile file viewers block JavaScript: use a real browser, or a local HTTP server.

Alternatively open `index.html` with its accompanying folders, or run:

```sh
python -m http.server 8000
```

Visit `http://localhost:8000`. A phone on the same network can connect to the computer's LAN IP on port 8000 if the firewall permits. There are no network calls, tracking, paid APIs or accounts.

## First prototype

- Original low-poly sedan with front wheels that visibly steer, mirrors, windows, lights and bumpers.
- Perspective 3D rendering with a smooth chase camera and a higher parking view.
- Analog touch steering wheel: drag around its centre; ±135° input, gradual return to centre.
- Bicycle-model turning, speed-sensitive steering angle, gentle acceleration and independent brakes.
- D/R gear selection with a stationary shift requirement. Reverse changes yaw direction naturally.
- Practice ground, planting islands, curbs, cones and one parking bay.
- Oriented-rectangle collision tests, contact counter, two-second stationary parking completion.
- Adjustable steering response and return rate; preferences persist locally when storage permits.
- Synthesized engine tone after player interaction; audio denial does not stop the game.
- Keyboard and simultaneous wheel/pedal pointer controls, pause on blur/background and pointer cancellation handling.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Accelerate | W / Up | Hold GO |
| Brake | S / Down / Space | Hold BRAKE |
| Steering | A D / Left Right | Drag steering wheel |
| Change gear | R, while stopped | D or R |
| Camera | C | View |
| Pause | P / Escape | Pause |

Stop fully before changing gears. Enter the mint parking bay with the whole car, align lengthwise and hold still for two seconds. There is no time limit. Pause → Reset restarts the car and challenge. Landscape is recommended on phones.

## Tuning the feel

Pause → **Steering response** controls how quickly input takes effect. **Return to centre** controls wheel self-centring. Try the default, then compare low and high values. Useful feedback: device/browser, steering too light or heavy, return too quick or slow, brake too sharp or weak, and whether the chase camera feels stable. Settings only are saved, not car position or session results.

`js/physics.js` uses metres, seconds and radians with a 2.65 m wheelbase, 35° low-speed steering lock and speed-dependent angle reduction. Simulation runs at 120 fixed steps/second with a capped frame delta. High speed is capped around 54 km/h, reverse around 19 km/h. These are arcade tuning choices, not a full tyre or suspension simulation.

## Structure

- `index.html` / `css/style.css`: responsive HUD, steering wheel, pedals and menus.
- `js/physics.js`: car motion, SAT collisions and parking validation.
- `js/renderer.js`: perspective projection, near-plane clipping and depth-sorted polygon drawing.
- `js/scene.js`: ground, scenery and original car geometry.
- `js/input.js`: keyboard, multi-pointer controls and cancellation.
- `js/audio.js`: optional synthesized engine.
- `js/game.js`: fixed-step loop, camera, challenge and settings.
- `tests/physics.cjs`: dependency-free logic tests.
- `tools/build_preview.py`: regenerates `preview.html` after source changes.

## Tests and current limitations

Run `node tests/physics.cjs` (Node is only needed for developer tests). Nine physics tests pass: motion/braking, forward/reverse steering, gear lock, steering return, speed sensitivity, rotated collision bounds, impact stopping, parking conditions and timestep comparison. All script paths and syntax were checked. The actual scene was rendered using native Canvas and visually inspected.

The remote browser could not access localhost (`ERR_BLOCKED_BY_CLIENT`), so browser console, real DOM interaction, multi-touch, physical Android/iPhone performance and subjective driving feel **have not yet been verified**. Do not call this production-ready. Required next checks: start/pause/reset; sustained driving and reverse; simultaneous touch steering/pedal; pointer cancellation; settings after reload; both cameras; corner collisions; parking completion; narrow portrait and landscape layouts.

This uses a lightweight software 3D renderer on Canvas, not WebGL. It is appropriate for the small practice scene, but painter sorting can show imperfect occlusion and the car remains a simple original low-poly model. No full city traffic, multiple cars, suspension, tyre skids, advanced lighting or career progression are included. Larger worlds should move to a WebGL engine after the driving prototype is approved. Browser keyboard controls approximate an analog wheel; actual phone feel needs user testing.

## Deployment later

When preview and feel are approved, these static files can be deployed with GitHub Pages using main / root. No server backend or build pipeline is required. Pages has deliberately **not** been enabled for this preview milestone.

## License

MIT. Code and procedural geometry are original. No Dr. Driving assets, logos, car models or maps are used.
