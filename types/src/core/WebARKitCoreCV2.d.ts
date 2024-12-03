export declare class WebARKitCoreCV {
    private cv;
    private version;
    private orb;
    private bfMatcher;
    private memoryData;
    private angle;
    private BlurSize;
    private template_keypoints_vector;
    private template_descriptors;
    private corners;
    private corners_out;
    private listeners;
    private ValidPointTotal;
    private N;
    private homography_transform;
    constructor();
    static initCV(): Promise<WebARKitCoreCV>;
    _initialize(): Promise<this>;
    loadTrackables(msg: any): void;
    loadSourceImage(imageData: ImageData): {
        id: number;
    };
    track(msg: any): ImageData | {
        type: string;
        matrix: string;
        corners: string;
        finalImage: ImageData;
    };
    private estimateCameraPosition;
    private clearMemory;
    private generateFilterArr;
    private filter;
    private draw;
    private drawPoints;
    private getCameraMatrix;
    private getDistortion;
    private matchKeypoints;
    convertToGray(img: any): any;
    private dot;
    private getProjectionMatrix;
    private getImageKeypoints;
    private imageDataFromMat;
    homographyValid(H: any): boolean;
    fill_output: (H: any, valid: boolean) => Float64Array<ArrayBuffer>;
    addEventListener(name: string, callback: object): void;
    dispatchEvent(event: {
        name: string;
        target: any;
        data?: object;
    }): void;
    private converter;
}
