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
        this.worker.onmessage = (ev) => {
            var msg = ev.data;
            switch (msg.type) {
                case "found": {
                    this.found(msg);
                    break;
                }
            }
        };
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
    /**
     * dispatch an event listener if the marker is lost or the matrix of the marker
     * if found.
     * @param msg message from the worker.
     */
    found(msg) {
        let world;
        if (!msg) {
            // commenting out this routine see https://github.com/webarkit/ARnft/pull/184#issuecomment-853400903
            //if (world) {
            world = null;
            /* const nftTrackingLostEvent = new CustomEvent<object>("nftTrackingLost-" + this.uuid + "-" + this.name, {
                  detail: { name: this.name },
              });
              this.target.dispatchEvent(nftTrackingLostEvent);*/
            //}
        }
        else {
            world = JSON.parse(msg.matrix);
            const matrixEvent = new CustomEvent("getMatrix", {
                detail: { matrix: world },
            });
            this.target.dispatchEvent(matrixEvent);
        }
    }
}
//export default null as any;
//# sourceMappingURL=WebARKitCVWorkers.js.map