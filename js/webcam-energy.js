/**
 * WebcamEnergy turns webcam movement into a smoothed number from 0 to 1.
 * Video frames are processed locally at low resolution and are never uploaded.
 */
class WebcamEnergy {
  constructor(video, options = {}) {
    if (!(video instanceof HTMLVideoElement)) {
      throw new TypeError('WebcamEnergy needs an HTMLVideoElement.');
    }

    this.video = video;
    this.width = options.width ?? 64;
    this.height = options.height ?? 48;
    this.sensitivity = options.sensitivity ?? 95;
    this.smoothing = options.smoothing ?? 0.22;
    this.sampleStride = options.sampleStride ?? 16;
    this.energy = 0;
    this.previousFrame = null;
    this.stream = null;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  async start(constraints = {}) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 320 },
        height: { ideal: 240 },
        ...constraints,
      },
      audio: false,
    });

    this.video.srcObject = this.stream;
    await this.video.play();
    return this;
  }

  update() {
    if (this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return this.energy;

    this.context.drawImage(this.video, 0, 0, this.width, this.height);
    const frame = this.context.getImageData(0, 0, this.width, this.height).data;
    let difference = 0;
    let samples = 0;

    if (this.previousFrame) {
      for (let index = 0; index < frame.length; index += this.sampleStride) {
        difference += Math.abs(frame[index] - this.previousFrame[index]);
        difference += Math.abs(frame[index + 1] - this.previousFrame[index + 1]);
        difference += Math.abs(frame[index + 2] - this.previousFrame[index + 2]);
        samples += 1;
      }
    }

    this.previousFrame = frame;
    const rawEnergy = samples ? Math.min(1, difference / samples / this.sensitivity) : 0;
    this.energy = this.energy * (1 - this.smoothing) + rawEnergy * this.smoothing;
    return this.energy;
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.video.srcObject = null;
    this.stream = null;
    this.previousFrame = null;
    this.energy = 0;
  }
}

window.WebcamEnergy = WebcamEnergy;
