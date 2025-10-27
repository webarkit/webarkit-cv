import Worker from "worker-loader?inline=no-fallback!./Worker";
export class AbstractWebARKitCVWorker {
  trackables;
  vw;
  vh;
  constructor(trackables, width, height) {
    this.trackables = trackables;
    this.vw = width;
    this.vh = height;
  }
}
export class WebARKitCVOrbWorker extends AbstractWebARKitCVWorker {
  worker;
  data;
  trackableWidth;
  trackableHeight;
  _processing = false;
  target;
  constructor(trackables, vwidth, vheight, twidth, theight, data) {
    super(trackables, vwidth, vheight);
    this.data = data;
    this.trackableWidth = twidth;
    this.trackableHeight = theight;
    this.target = window || global;
  }
  async initialize() {
    console.log("WebARKitCVOrbWorker initialized");
    this.worker = new Worker();
    return await this.loadTrackables();
  }
  /**
   * This is the function that will pass the video stream to the worker.
   * @param imagedata the image data from the video stream.
   * @returns void
   */
  process(imagedata) {
    if (this._processing) {
      return;
    }
    this._processing = true;
    console.log("WebARKitCVOrbWorker process imagedata: ", imagedata);
    // Validate ImageData buffer size before posting to worker. This helps
    // catch mismatches early (for example when the processing canvas size is
    // different from the video dimensions). We log a clear warning so callers
    // can fix the producer rather than relying on worker-side fallbacks.
    try {
      const bufLen = imagedata.data?.buffer?.byteLength ?? 0;
      const expected = 4 * imagedata.width * imagedata.height;
      if (bufLen !== expected) {
        // eslint-disable-next-line no-console
        console.warn(
          `Posting ImageData to worker: buffer length (${bufLen}) !== 4*width*height (${expected}). This will likely cause an error in the worker.`,
          { bufLen, width: imagedata.width, height: imagedata.height },
        );
      }
    } catch (e) {
      // Non-fatal: just log and continue
      // eslint-disable-next-line no-console
      console.warn("Failed to validate ImageData buffer length:", e);
    }
    this.worker.postMessage({
      type: "process",
      // send the actual ImageData buffer and its width/height so the worker
      // can reconstruct the ImageData exactly as produced by the renderer.
      imagedata: imagedata.data.buffer,
      vWidth: imagedata.width,
      vHeight: imagedata.height,
    });
  }
  loadTrackables() {
    this.worker.postMessage({
      type: "loadTrackables",
      data: this.data,
      trackableWidth: this.trackableWidth,
      trackableHeight: this.trackableHeight,
    });
    this.worker.onmessage = (ev) => {
      const msg = ev.data;
      //console.log(msg);
      switch (msg.type) {
        case "found": {
          this.found(msg);
          break;
        }
        case "not found": {
          this.found(null);
          break;
        }
      }
      this._processing = false;
    };
    return Promise.resolve(true);
  }
  /**
   * dispatch an event listener if the marker is lost or the matrix of the marker
   * if found.
   * @param msg message from the worker.
   */
  found(msg) {
    let world;
    let corners;
    let finalImage;
    if (!msg) {
      // commenting out this routine see https://github.com/webarkit/ARnft/pull/184#issuecomment-853400903
      //if (world) {
      //world = null;
      /* const nftTrackingLostEvent = new CustomEvent<object>("nftTrackingLost-" + this.uuid + "-" + this.name, {
                  detail: { name: this.name },
              });
              this.target.dispatchEvent(nftTrackingLostEvent);*/
      //}
      finalImage = new ImageData(this.vw, this.vh);
      console.log("finalImage: ", finalImage);
      const lostEvent = new CustomEvent("lostMarker", {
        detail: { matrix: null, corners: null, finalImage: finalImage },
      });
      this.target.dispatchEvent(lostEvent);
    } else {
      world = JSON.parse(msg.matrix);
      corners = JSON.parse(msg.corners);
      finalImage = msg.finalImage;
      const matrixEvent = new CustomEvent("getMatrix", {
        detail: { matrix: world, corners: corners, finalImage: finalImage },
      });
      this.target.dispatchEvent(matrixEvent);
    }
  }
}
//export default null as any;
//# sourceMappingURL=WebARKitCVWorkers.js.map
