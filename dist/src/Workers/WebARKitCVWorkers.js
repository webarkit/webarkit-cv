import Worker from "worker-loader?inline=no-fallback!./Worker";
export class AbstractWebARKitCVWorker {
    trackables;
    opencv;
    vw;
    vh;
    constructor(trackables, width, height, opencv) {
        this.trackables = trackables;
        this.vw = width;
        this.vh = height;
        this.opencv = opencv;
    }
}
export class WebARKitCVOrbWorker extends AbstractWebARKitCVWorker {
    worker;
    data;
    trackableWidth;
    trackableHeight;
    constructor(trackables, width, height, data, opencv) {
        super(trackables, width, height, opencv);
        this.data = data;
        this.trackableWidth = width;
        this.trackableHeight = height;
    }
    async initialize() {
        console.log("WebARKitCVOrbWorker initialized");
        this.worker = new Worker();
        return await this.loadTrackables();
    }
    process() {
        console.log("WebARKitCVWorker process");
    }
    loadTrackables() {
        this.worker.postMessage({
            type: "loadTrackables",
            data: this.data,
            trackableWidth: this.trackableWidth,
            trackableHeight: this.trackableHeight
        });
        return Promise.resolve(true);
    }
}
//export default null as any;
//# sourceMappingURL=WebARKitCVWorkers.js.map