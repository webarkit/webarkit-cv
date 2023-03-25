import { WebARKitCVBuilder } from "./interfaces/WebARKitCVBuilder";
import { WebARKitBase } from "./interfaces/WebARKitCVBuilder";
import { ITracker } from "./interfaces/Trackers";
export declare class WebARKitCV implements WebARKitCVBuilder {
    private webarkit;
    private version;
    private trackableCount;
    private trackableWorkers;
    /**
     * WebARKitCV constructor it implements the WebARKitCVBuilder interface.
     * The class implements the Builder pattern to create a WebARKitCV object.
     * Example:
     * ```js
     * import { WebARKitCV } from '@webarkit/webarkit-cv';
     *
     *      const webarkit = new WebARKitCV();
     *      webarkit.setWidth(640)
     *      .setHeight(480)
     *      .addTrackable("pinball", "./pinball.jpg")
     *      .loadTrackables()
     *      const track = webarkit.build();
     * ```
     * @constructor WebARKitCV
     * @param {WebARKitBase} webarkit
     * @param {string} version
     *
     */
    constructor();
    /**
     * You can set the width of the video/image element as source of the tracking.
     * @param {number} width
     * @returns {WebARKitCVBuilder}
     */
    setWidth(width: number): WebARKitCVBuilder;
    /**
     * You can set the height of the video/image element as source of the tracking.
     * @param  {number} height
     * @returns {WebARKitCVBuilder}
     */
    setHeight(height: number): WebARKitCVBuilder;
    /**
     * Add a trackable to the trackables list. Every trackabe must have a name and a url.
     * The name is used to identify the trackable and the url is the path of the image.
     * Internally the class uses the uuid library to generate a unique id for each trackable.
     * @param  {string} trackableName
     * @param  {string} trackableUrl
     * @returns {WebARKitCVBuilder}
     */
    addTrackable(trackableName: string, trackableUrl: string): WebARKitCVBuilder;
    /**
     * Initialize the trackables. This method initialize the workers and load the images.
     * @returns {WebARKitCVBuilder}
     */
    loadTrackables(): WebARKitCVBuilder;
    /**
     * Used internally to set the isLoaded property of the WebARKitCV object.
     * @param {boolean} isLoaded
     * @returns {WebARKitCVBuilder}
     */
    private setIsLoaded;
    /**
     * Build the WebARKitCV object. This is the last method to call in the chain.
     * See {@link WebARKitCV.constructor} WebARKitCV for an example.
     * @returns {WebARKitBase}
     */
    build(): WebARKitBase;
    track(trackers: Map<number, ITracker>): Promise<Map<number, ITracker>>;
    /**
     * Clear the WebARKitCV object. Used internally.
     */
    private clear;
}
