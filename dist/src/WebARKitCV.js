import { WebARKitBase } from "./interfaces/WebARKitCVBuilder";
import { Trackable } from "./interfaces/Trackables";
import { WebARKitCVOrbWorker } from "./Workers/WebARKitCVWorkers";
import { imread } from "./io/imgFunctions";
import { v4 as uuidv4 } from "uuid";
import packageJson from "../package.json";
const { version } = packageJson;
export class WebARKitCV {
    webarkit;
    version;
    trackableCount = 0;
    trackableWorkers = [];
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
    constructor() {
        this.version = version;
        console.info("WebARKitCV ", this.version);
        this.webarkit = new WebARKitBase();
        this.clear();
        this.webarkit.trackable = new Trackable("", "", "");
        this.webarkit.trackables = new Map();
        this.webarkit.trackers = new Map();
        this.webarkit.isLoaded = false;
    }
    /**
     * You can set the width of the video/image element as source of the tracking.
     * @param {number} width
     * @returns {WebARKitCVBuilder}
     */
    setWidth(width) {
        this.webarkit.width = width;
        return this;
    }
    /**
     * You can set the height of the video/image element as source of the tracking.
     * @param  {number} height
     * @returns {WebARKitCVBuilder}
     */
    setHeight(height) {
        this.webarkit.height = height;
        return this;
    }
    /**
     * Add a trackable to the trackables list. Every trackabe must have a name and a url.
     * The name is used to identify the trackable and the url is the path of the image.
     * Internally the class uses the uuid library to generate a unique id for each trackable.
     * @param  {string} trackableName
     * @param  {string} trackableUrl
     * @returns {WebARKitCVBuilder}
     */
    addTrackable(trackableName, trackableUrl) {
        if (typeof trackableName === "string" && typeof trackableUrl === "string") {
            this.webarkit.trackable.name = trackableName;
            this.webarkit.trackable.url = trackableUrl;
            this.webarkit.trackable.uuid = uuidv4();
            this.webarkit.trackables?.set(this.trackableCount++, this.webarkit.trackable);
        }
        else {
            throw new Error("Trackable name and url must be strings");
        }
        return this;
    }
    /**
     * Initialize the trackables. This method initialize the workers and load the images.
     * @returns {WebARKitCVBuilder}
     */
    loadTrackables() {
        const trackables = this.webarkit.trackables;
        trackables.forEach((trackable, index) => {
            var data = imread(trackable.name);
            this.trackableWorkers.push(new WebARKitCVOrbWorker(trackables, this.webarkit.width, this.webarkit.height, data.width, data.height, data));
            this.webarkit.trackers?.set(index, {
                name: trackable.name,
                uuid: trackable.uuid,
                matrix: new Float32Array(),
            });
            this.trackableWorkers[index].initialize();
        });
        return this;
    }
    /**
     * Used internally to set the isLoaded property of the WebARKitCV object.
     * @param {boolean} isLoaded
     * @returns {WebARKitCVBuilder}
     */
    setIsLoaded(isLoaded) {
        this.webarkit.isLoaded = isLoaded;
        return this;
    }
    /**
     * Build the WebARKitCV object. This is the last method to call in the chain.
     * See {@link WebARKitCV.constructor} WebARKitCV for an example.
     * @returns {WebARKitBase}
     */
    build() {
        const webarkit = this.webarkit;
        this.setIsLoaded(true);
        this.clear();
        return webarkit;
    }
    async track(trackers, imgData) {
        console.info("Start tracking!");
        try {
            let _update = () => {
                if (true) {
                    this.trackableWorkers.forEach((trackable) => {
                        trackable.process(imgData);
                    });
                }
                requestAnimationFrame(_update);
            };
            _update();
            return Promise.resolve(trackers);
        }
        catch (e) {
            console.error(e);
            return Promise.reject(false);
        }
    }
    /**
     * Clear the WebARKitCV object. Used internally.
     */
    clear() {
        this.webarkit = new WebARKitBase();
    }
}
//# sourceMappingURL=WebARKitCV.js.map