import Worker from "worker-loader?inline=no-fallback!./Worker";
import { ITrackable } from "../interfaces/Trackables";

export abstract class AbstractWebARKitCVWorker {
  protected trackables: Map<number, ITrackable>;
  protected vw: number;
  protected vh: number;
  constructor(
    trackables: Map<number, ITrackable>,
    width: number,
    height: number
  ) {
    this.trackables = trackables;
    this.vw = width;
    this.vh = height;
  }
  abstract initialize(): Promise<boolean>;
  abstract process(imagedata: ImageData): void;
}

export class WebARKitCVOrbWorker extends AbstractWebARKitCVWorker {
  private worker!: Worker;
  private data: any;
  private trackableWidth: number;
  private trackableHeight: number;
  private _processing: boolean = false;
  private target: EventTarget;
  constructor(
    trackables: Map<number, ITrackable>,
    vwidth: number,
    vheight: number,
    twidth: number,
    theight: number,
    data: any
  ) {
    super(trackables, vwidth, vheight);
    this.data = data;
    this.trackableWidth = twidth;
    this.trackableHeight = theight;
    this.target = window || global;
  }

  public async initialize(): Promise<boolean> {
    console.log("WebARKitCVOrbWorker initialized");
    this.worker = new Worker();
    return await this.loadTrackables();
  }

  /**
   * This is the function that will pass the video stream to the worker.
   * @param imageData the image data from the video stream.
   * @returns void
   */
  public process(imagedata: ImageData): void {
    if (this._processing) {
      return;
    }
    this._processing = true;

    this.worker.postMessage({
      type: "process",
      imagedata: imagedata.data.buffer,
      vWidth: this.vw,
      vHeight: this.vh,
    });
    this.worker.onmessage = (ev: any) => {
      var msg = ev.data;
      switch (msg.type) {
        case "found": {
          this.found(msg);
          break;
        }
      }
    };
  }

  protected loadTrackables(): Promise<boolean> {
    this.worker.postMessage({
      type: "loadTrackables",
      data: this.data,
      trackableWidth: this.trackableWidth,
      trackableHeight: this.trackableHeight,
    });
    return Promise.resolve(true);
  }

  /**
   * dispatch an event listener if the marker is lost or the matrix of the marker
   * if found.
   * @param msg message from the worker.
   */
  public found(msg: any) {
    let world: Float64Array;
    if (!msg) {
      // commenting out this routine see https://github.com/webarkit/ARnft/pull/184#issuecomment-853400903
      //if (world) {
      world = null;
      /* const nftTrackingLostEvent = new CustomEvent<object>("nftTrackingLost-" + this.uuid + "-" + this.name, {
            detail: { name: this.name },
        });
        this.target.dispatchEvent(nftTrackingLostEvent);*/
      //}
    } else {
      world = JSON.parse(msg.matrix);
      const matrixEvent = new CustomEvent<object>("getMatrix", {
        detail: { matrix: world },
      });
      this.target.dispatchEvent(matrixEvent);
    }
  }
}

//export default null as any;
