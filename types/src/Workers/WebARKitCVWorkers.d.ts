import { ITrackable } from "../interfaces/Trackables";
export declare abstract class AbstractWebARKitCVWorker {
    protected trackables: Map<number, ITrackable>;
    protected opencv: any;
    protected vw: number;
    protected vh: number;
    constructor(trackables: Map<number, ITrackable>, width: number, height: number, opencv: any);
    abstract initialize(): Promise<boolean>;
    abstract process(): void;
}
export declare class WebARKitCVOrbWorker extends AbstractWebARKitCVWorker {
    private worker;
    private data;
    private trackableWidth;
    private trackableHeight;
    constructor(trackables: Map<number, ITrackable>, width: number, height: number, data: any, opencv: any);
    initialize(): Promise<boolean>;
    process(): void;
    protected loadTrackables(): Promise<boolean>;
}
