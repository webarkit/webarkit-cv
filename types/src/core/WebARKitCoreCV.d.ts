export declare class WebARKitCoreCV {
    private cv;
    private version;
    private BlurSize;
    private template_keypoints_vector;
    private template_descriptors;
    private corners;
    private listeners;
    private ValidPointTotal;
    private N;
    private homography_transform;
    constructor();
    static initCV(): Promise<WebARKitCoreCV>;
    _initialize(): Promise<this>;
    loadTrackables(msg: any): void;
    track(msg: any): {
        type: string;
        matrix: string;
    };
    homographyValid(H: any): boolean;
    fill_output: (H: any, valid: boolean) => Float64Array;
    addEventListener(name: string, callback: object): void;
    dispatchEvent(event: {
        name: string;
        target: any;
        data?: object;
    }): void;
    private converter;
}
