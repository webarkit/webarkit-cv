import { WebARKitBase } from './interfaces/WebARKitCVBuilder';
import { Trackable } from "./interfaces/Trackables";
import { WebARKitCVOrbWorker } from "./Workers/WebARKitCVWorkers";
import { imread } from './io/imgFunctions';
import { v4 as uuidv4 } from "uuid";
import packageJson from "../package.json";
const { version } = packageJson;
export class WebARKitCV {
    webarkit;
    version;
    trackableCount = 0;
    trackableWorkers = [];
    constructor(webarkit) {
        this.version = version;
        console.info("WebARKitCV ", this.version);
        this.webarkit = webarkit;
        this.clear();
        this.webarkit.trackable = new Trackable("", "", "");
        this.webarkit.trackables = new Map();
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
            this.webarkit.trackable.uuid = uuidv4();
            this.webarkit.trackables?.set(this.trackableCount++, this.webarkit.trackable);
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
    loadTrackables() {
        const trackables = this.webarkit.trackables;
        trackables.forEach((trackable, index) => {
            var data = imread(trackable.name);
            this.trackableWorkers.push(new WebARKitCVOrbWorker(trackables, data.width, data.height, data));
            this.trackableWorkers[index].initialize();
        });
        return this;
    }
    clear() {
        this.webarkit = new WebARKitBase();
    }
}
//# sourceMappingURL=WebARKitCV.js.map