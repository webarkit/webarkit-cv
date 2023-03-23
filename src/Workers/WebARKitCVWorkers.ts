import Worker from "worker-loader?inline=no-fallback!./Worker";
import { ITrackable } from "../interfaces/Trackables";

export abstract class AbstractWebARKitCVWorker{
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
    private worker: Worker | undefined;
    constructor(trackables: Map<number, ITrackable>, width: number, height: number, opencv: any) {
        super(trackables, width, height, opencv);        
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
        let imgWidth, imgHeight = 0;

        this.worker!.postMessage({
            type: "loadTrackable",
            pw: imgWidth,
            ph: imgHeight,
            marker: this.trackables.get(0)!.url,
        });
        return Promise.resolve(true);
    }
 }
