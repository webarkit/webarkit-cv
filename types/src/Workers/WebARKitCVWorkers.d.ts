import { ITrackable } from "../interfaces/Trackables";
export declare abstract class AbstractWebARKitCVWorker {
    protected trackables: Map<number, ITrackable>;
    protected vw: number;
    protected vh: number;
    constructor(trackables: Map<number, ITrackable>, width: number, height: number);
    abstract initialize(): Promise<boolean>;
    abstract process(imagedata: ImageData): void;
}
export declare class WebARKitCVOrbWorker extends AbstractWebARKitCVWorker {
    private worker;
    private data;
    private trackableWidth;
    private trackableHeight;
    private _processing;
    private target;
    constructor(trackables: Map<number, ITrackable>, vwidth: number, vheight: number, twidth: number, theight: number, data: any);
    initialize(): Promise<boolean>;
    /**
     * This is the function that will pass the video stream to the worker.
     * @param imageData the image data from the video stream.
     * @returns void
     */
    process(imagedata: ImageData): void;
    protected loadTrackables(): Promise<boolean>;
    /**
     * dispatch an event listener if the marker is lost or the matrix of the marker
     * if found.
     * @param msg message from the worker.
     */
    found(msg: any): void;
}
