import { ITrackable } from "./Trackables";
import { ITracker } from "./Trackers";
export declare class WebARKitBase {
    width?: number | undefined;
    height?: number | undefined;
    trackable?: ITrackable | undefined;
    trackables?: Map<number, ITrackable> | undefined;
    trackers?: Map<number, ITracker> | undefined;
    isLoaded?: boolean | undefined;
    /**
     * The WebARKitBase class is the base class for the WebARKitCV class.
     * This class is used to create a WebARKitCV object with the Builder pattern.
     * @param {number} width
     * @param {number} height
     * @param {ITrackable} trackable
     * @param {Map<number, ITrackable>} trackables
     * @param {Map<number, ITracker>} trackers
     * @param {boolean} isLoaded
     */
    constructor(width?: number | undefined, height?: number | undefined, trackable?: ITrackable | undefined, trackables?: Map<number, ITrackable> | undefined, trackers?: Map<number, ITracker> | undefined, isLoaded?: boolean | undefined);
}
/**
 * @description
 * The WebARKitCVBuilder interface is used to create a WebARKitCV object with the Builder pattern.
 */
export interface WebARKitCVBuilder {
    setWidth(width: number): WebARKitCVBuilder;
    setHeight(height: number): WebARKitCVBuilder;
    addTrackable(trackableName: string, trackableUrl: string): WebARKitCVBuilder;
    loadTrackables(): WebARKitCVBuilder;
    build(): WebARKitBase;
}
