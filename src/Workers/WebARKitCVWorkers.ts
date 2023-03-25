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
  constructor(
    trackables: Map<number, ITrackable>,
    width: number,
    height: number,
    data: any
  ) {
    super(trackables, width, height);
    this.data = data;
    this.trackableWidth = width;
    this.trackableHeight = height;
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

    this.worker.postMessage({ type: "process", imagedata }, [
      imagedata.data.buffer,
    ]);
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
}

//export default null as any;
