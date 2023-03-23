import { ITrackable } from "./Trackables";
export declare class WebARKitBase {
    width?: number | undefined;
    height?: number | undefined;
    trackable?: ITrackable | undefined;
    isLoaded?: boolean | undefined;
    opencv?: any;
    constructor(width?: number | undefined, height?: number | undefined, trackable?: ITrackable | undefined, isLoaded?: boolean | undefined, opencv?: any);
}
export interface WebARKitCVBuilder {
    setWidth(width: number): WebARKitCVBuilder;
    setHeight(height: number): WebARKitCVBuilder;
    addTrackable(trackableName: string, trackableUrl: string): WebARKitCVBuilder;
    build(): WebARKitBase;
}
