export class WebARKitBase {
    width;
    height;
    trackable;
    trackables;
    isLoaded;
    opencv;
    constructor(width, height, trackable, trackables, isLoaded, opencv) {
        this.width = width;
        this.height = height;
        this.trackable = trackable;
        this.trackables = trackables;
        this.isLoaded = isLoaded;
        this.opencv = opencv;
    }
}
//# sourceMappingURL=WebARKitCVBuilder.js.map