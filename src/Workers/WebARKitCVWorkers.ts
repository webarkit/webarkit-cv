import Worker from "worker-loader?inline=no-fallback!./Worker";
import { ITrackable } from "../interfaces/Trackables";

export abstract class AbstractWebARKitCVWorker {
    protected trackables: Map<number, ITrackable>;
    protected opencv: any;
    protected vw: number;
    protected vh: number;
    constructor(trackables: Map<number, ITrackable>, width: number, height: number, opencv: any) {
        this.trackables = trackables;
        this.vw = width;
        this.vh = height;
        this.opencv = opencv;
    }
    abstract initialize(): Promise<boolean>;
    abstract process(): void;
}

export class WebARKitCVOrbWorker extends AbstractWebARKitCVWorker {
    private worker!: Worker;
    private data: any;
    private trackableWidth: number;
    private trackableHeight: number;
    constructor(trackables: Map<number, ITrackable>, width: number, height: number, data: any, opencv: any) {
        super(trackables, width, height, opencv);
        this.data = data;
        this.trackableWidth = width;
        this.trackableHeight = height;
    }

    public async initialize(): Promise<boolean> {
        console.log("WebARKitCVOrbWorker initialized");
        this.worker = new Worker();
        return await this.loadTrackables();
    }

    public process(): void {
        console.log("WebARKitCVWorker process");
    }

    protected loadTrackables(): Promise<boolean> {
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