import { WebARKitCVBuilder } from './interfaces/WebARKitCVBuilder';
import { WebARKitBase } from './interfaces/WebARKitCVBuilder';
export declare class WebARKitCV implements WebARKitCVBuilder {
    private webarkit;
    private version;
    constructor(webarkit: WebARKitBase);
    setWidth(width: number): WebARKitCVBuilder;
    setHeight(height: number): WebARKitCVBuilder;
    addTrackable(trackableName: string | undefined, trackableUrl: string): WebARKitCVBuilder;
    private setIsLoaded;
    build(): WebARKitBase;
    private clear;
    private initCV;
}
