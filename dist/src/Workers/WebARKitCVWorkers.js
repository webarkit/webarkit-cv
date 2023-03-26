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
    constructor(trackables, vwidth, vheight, twidth, theight, data) {
        super(trackables, vwidth, vheight);
        this.data = data;
        this.trackableWidth = twidth;
        this.trackableHeight = theight;
    }
    async initialize() {
        console.log("WebARKitCVOrbWorker initialized");
        this.worker = new Worker();
        return await this.loadTrackables();
    }
    /**
     * This is the function that will pass the video stream to the worker.
     * @param imageData the image data from the video stream.
     * @returns void
     */
    process(imagedata) {
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
    }
    loadTrackables() {
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
//# sourceMappingURL=WebARKitCVWorkers.js.map