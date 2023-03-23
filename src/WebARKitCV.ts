import cv from '../build/opencv_js'
import { WebARKitCVBuilder } from './interfaces/WebARKitCVBuilder';
import { WebARKitBase } from './interfaces/WebARKitCVBuilder';
import { ITrackable, Trackable } from "./interfaces/Trackables";
import { v4 as uuidv4 } from "uuid";
import packageJson from "../package.json";
const { version } = packageJson;

export class WebARKitCV implements WebARKitCVBuilder {
    private webarkit: WebARKitBase;
    private version: string;
    private trackableCount: number = 0;
    constructor(webarkit: WebARKitBase) {
        this.version = version;
        console.info("WebARKitCV ", this.version);
        this.webarkit = webarkit;
        this.clear();
        this.webarkit.trackable = new Trackable("", "", "");
        this.webarkit.trackables = new Map<number, ITrackable>()
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

    public addTrackable(trackableName: string, trackableUrl: string): WebARKitCVBuilder {       
        if (typeof trackableName === 'string' && typeof trackableUrl === 'string' ) {        
        this.webarkit!.trackable!.name = trackableName;
        this.webarkit!.trackable!.url = trackableUrl;
        this.webarkit!.trackable!.uuid = uuidv4();
        this.webarkit!.trackables?.set(this.trackableCount++, this.webarkit!.trackable!);
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
        return opencv;
    }
}