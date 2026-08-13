# Go-Go Games

[Play Go-Go Games](https://davidrs.github.io/go-go-games/)

Go-Go Games is a community project for making simple, playful browser games that get little kids moving. Contributions are welcome: add a new game, improve an existing one, or make the shared motion controls easier to use.

The games process webcam frames locally in the browser. Video is not recorded or uploaded.

## Games

- [Go, Go Train!](https://davidrs.github.io/go-go-games/games/train/) — dance, wave, or wiggle to make the train move.

Every game has its own permanent folder URL, so families can bookmark a favorite directly.

## Webcam energy utility

[`js/webcam-energy.js`](js/webcam-energy.js) turns webcam movement into a smoothed **energy level from `0` to `1`**. It owns camera startup, low-resolution frame comparison, smoothing, and cleanup so games can focus on play.

Include the utility and give it a video element:

```html
<video id="camera" autoplay muted playsinline></video>
<script src="../../js/webcam-energy.js"></script>
<script>
  const motion = new WebcamEnergy(document.querySelector('#camera'));

  async function startGame() {
    await motion.start(); // Call from a button click so the browser can ask for permission.
    requestAnimationFrame(updateGame);
  }

  function updateGame() {
    const energy = motion.update(); // 0 = still, 1 = lots of movement
    // Use energy to control speed, size, volume, points, etc.
    requestAnimationFrame(updateGame);
  }
</script>
```

Optional constructor settings:

```js
const motion = new WebcamEnergy(video, {
  sensitivity: 95, // Lower values react more strongly.
  smoothing: 0.22, // Higher values respond faster; lower values feel steadier.
  noiseFloor: 0.06, // Ignore small camera-sensor and lighting fluctuations.
  idleCutoff: 0.015, // Snap fading energy to zero so games fully stop.
  width: 64,
  height: 48,
  sampleStride: 16,
});
```

Call `motion.stop()` when leaving a game or when the camera is no longer needed.

## Adding a new game

1. Create a folder at `games/your-game/index.html`. Keeping one game per folder gives it a direct, bookmarkable URL.
2. Build the game with plain HTML, CSS, and JavaScript. Keep controls large, instructions short, and feedback immediate.
3. Reuse `js/webcam-energy.js` when movement should drive the game. Load it with `../../js/webcam-energy.js`, create a `WebcamEnergy` instance, call `start()` from a clear button press, and read `update()` once per animation frame.
4. Add a game card to the root `index.html` linking to `games/your-game/`.
5. Add the game to the list in this README and open a pull request.

Please avoid analytics and uploads, ask for camera access only after a deliberate button press, explain why the camera is needed, and provide a friendly message if permission is denied.
