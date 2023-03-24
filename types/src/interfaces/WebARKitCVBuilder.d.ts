import { ITrackable } from "./Trackables";
export declare class WebARKitBase {
    width?: number | undefined;
    height?: number | undefined;
    trackable?: ITrackable | undefined;
    trackables?: Map<number, ITrackable> | undefined;
    isLoaded?: boolean | undefined;
    constructor(width?: number | undefined, height?: number | undefined, trackable?: ITrackable | undefined, trackables?: Map<number, ITrackable> | undefined, isLoaded?: boolean | undefined);
}
export interface WebARKitCVBuilder {
    setWidth(width: number): WebARKitCVBuilder;
    setHeight(height: number): WebARKitCVBuilder;
    addTrackable(trackableName: string, trackableUrl: string): WebARKitCVBuilder;
    loadTrackables(): WebARKitCVBuilder;
    build(): WebARKitBase;
}
