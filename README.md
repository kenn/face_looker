# Face Looker (Sprite) 👁️

Create an interactive face that follows the cursor using plain HTML, CSS, and JavaScript. No frameworks. No build step.

## What this is

- A tiny vanilla JS widget that shifts a sprite sheet based on pointer position
- Designed to work with a pre-generated grid of face images (generated elsewhere)

## Quick start

1. Export an atlas sprite into `public/face.webp` (or point `data-sprite` at your own filename).  
   The sheet must contain a grid of square frames (default 256×256) with one frame per gaze:

   - Columns advance `px` from left (−15) to right (+15)
   - Rows advance `py` from top (+15) to bottom (−15)
   - The grid uses the same range and step as your generator (defaults below)

2. Open `public/index.html` in a browser (or serve the `public/` folder with any static server).

That's it. Move your cursor over the face.

## Configuration

In `public/index.html`, adjust attributes on the `.face-tracker` element:

- `data-sprite` (default `face.webp`) — path to the sprite sheet
- `data-debug` (`true` | `false`) — show overlay with mouse coords, quantized values, and sprite index

Multiple faces are supported — add more `.face-tracker` elements pointing at different sprite files.

## How it works

`face-tracker.js` maps pointer position to normalized coordinates in \([-1, 1]\), snaps to the nearest grid point using your step size, then shifts the sprite sheet to the matching frame.

If you change your generation parameters, update these constants in `public/face-tracker.js` to match:

```
const P_MIN = -15;
const P_MAX = 15;
const STEP = 3;
```

## Styling

Edit `public/face-tracker.css` to change size, shape, or add effects. Wrap the `.face-tracker` in your own container to control its dimensions.

## Reference

- Original post: https://x.com/fofrAI/status/1986076417809928568
- Replicate playground: https://replicate.com/kylan02/face-looker

## License

MIT — use in personal and commercial projects.
