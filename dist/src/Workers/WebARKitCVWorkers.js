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
    constructor(trackables, width, height, opencv) {
        super(trackables, width, height, opencv);
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
        let imgWidth, imgHeight = 0;
        this.worker.postMessage({
            type: "loadTrackable",
            pw: imgWidth,
            ph: imgHeight,
            marker: this.trackables.get(0).url,
        });
        return Promise.resolve(true);
    }
}
//# sourceMappingURL=WebARKitCVWorkers.js.map