import cv from '../build/opencv_js';
export class WebARKitCV {
    constructor() {
        console.log('WebARKitCV');
    }
    async init() {
        const opencv = await cv();
        console.log(opencv);
        return opencv;
    }
}
//# sourceMappingURL=index.js.map