import { VideoSettingData } from "../config/ConfigData";
export interface ICameraViewRenderer {
    facing: string;
    readonly frame: number;
    getFrame: () => number;
    height: number;
    width: number;
    readonly image: ImageData;
    getImage: () => ImageData;
    initialize: (videoSettings: VideoSettingData) => Promise<boolean>;
    destroy: () => void;
}
export declare class CameraViewRenderer implements ICameraViewRenderer {
    private canvas_process;
    private context_process;
    _video: HTMLVideoElement;
    private _facing;
    private vw;
    private vh;
    private w;
    private h;
    private pw;
    private ph;
    private ox;
    private oy;
    private target;
    private targetFrameRate;
    private imageDataCache;
    private _frame;
    private lastCache;
    private preserveImageSize;
    private targetLongSide;
    constructor(video: HTMLVideoElement);
    get facing(): string;
    get height(): number;
    get width(): number;
    get video(): HTMLVideoElement;
    get frame(): number;
    get canvasProcess(): HTMLCanvasElement;
    get contextProcess(): CanvasRenderingContext2D;
    /**
     * Preserve the processing canvas size as the original video frame size when true.
     * By default the processing canvas is resized to 320px max dimension to reduce computation.
     * @param preserve use original video dimensions when preparing frames
     */
    setPreserveImageSize(preserve: boolean): void;
    /**
     * Set the target size (longest side) of the processing canvas when
     * preserveImageSize is false. Defaults to 320.
     */
    setTargetLongSideLength(size: number): void;
    /**
     * Set the maximum capture frequency (frames per second) when sampling the
     * video into ImageData. Lower values reduce CPU usage.
     */
    setTargetFrameRate(fps: number): void;
    getFrame(): number;
    getImage(): ImageData;
    get image(): ImageData;
    /**
     * Draw the detected corners on the processing canvas.
     * corners must be an array of 8 numbers: [x0,y0,x1,y1,x2,y2,x3,y3]
     */
    drawCorners(corners: number[] | null, color?: string, lineWidth?: number): void;
    prepareImage(): void;
    private updateImageCache;
    private getCachedImage;
    initialize(videoSettings: VideoSettingData): Promise<boolean>;
    destroy(): void;
}
