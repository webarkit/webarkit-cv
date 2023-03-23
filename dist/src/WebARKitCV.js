import cv from '../build/opencv_js';
import { WebARKitBase } from './interfaces/WebARKitCVBuilder';
import packageJson from "../package.json";
const { version } = packageJson;
export class WebARKitCV {
    webarkit;
    version;
    constructor(webarkit) {
        this.version = version;
        console.info("WebARKitCV ", this.version);
        this.webarkit = webarkit;
        this.clear();
        this.webarkit.opencv = this.initCV();
        this.webarkit.isLoaded = false;
    }
    setWidth(width) {
        this.webarkit.width = width;
        return this;
    }
    setHeight(height) {
        this.webarkit.height = height;
        return this;
    }
    addTrackable(trackableName, trackableUrl) {
        if (typeof trackableName === 'string' && typeof trackableUrl === 'string') {
            this.webarkit.trackable.name = trackableName;
            this.webarkit.trackable.url = trackableUrl;
        }
        else {
            throw new Error('Trackable name and url must be strings');
        }
        return this;
    }
    setIsLoaded(isLoaded) {
        this.webarkit.isLoaded = isLoaded;
        return this;
    }
    build() {
        const webarkit = this.webarkit;
        this.setIsLoaded(true);
        this.clear();
        return webarkit;
    }
    clear() {
        this.webarkit = new WebARKitBase();
    }
    async initCV() {
        const opencv = await cv();
        console.log(opencv);
        return opencv;
    }
}
//# sourceMappingURL=WebARKitCV.js.map