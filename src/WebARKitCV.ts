import cv from '../build/opencv_js'
import { WebARKitCVBuilder } from './interfaces/WebARKitCVBuilder';
import { WebARKitBase } from './interfaces/WebARKitCVBuilder';
import packageJson from "../package.json";
const { version } = packageJson;

export class WebARKitCV implements WebARKitCVBuilder {
    private webarkit: WebARKitBase;
    private version: string;
    constructor(webarkit: WebARKitBase) {
        this.version = version;
        console.info("WebARKitCV ", this.version);
        this.webarkit = webarkit;
        this.clear();
        this.webarkit.opencv = this.initCV();
        this.webarkit.isLoaded = false;
    }

    public setWidth(width: number): WebARKitCVBuilder {
        this.webarkit.width = width;
        return this;
    }

    public setHeight(height: number): WebARKitCVBuilder {
        this.webarkit.height = height;
        return this;
    }

    public addTrackable(trackableName: string | undefined, trackableUrl: string): WebARKitCVBuilder {
        if (typeof trackableName === 'string' && typeof trackableUrl === 'string' ) {
        this.webarkit!.trackable!.name = trackableName;
        this.webarkit!.trackable!.url = trackableUrl;
        } else {
            throw new Error('Trackable name and url must be strings');
        }
        return this;
    }

    private setIsLoaded(isLoaded: boolean): WebARKitCVBuilder {
        this.webarkit.isLoaded = isLoaded;
        return this;
    }

    public build(): WebARKitBase {
        const webarkit = this.webarkit;
        this.setIsLoaded(true);
        this.clear();
        return webarkit
    }

    private clear(): void {
        this.webarkit = new WebARKitBase();
    }

    private async initCV(): Promise<any> {
        const opencv = await cv();
        console.log(opencv);
        return opencv;
    }
}