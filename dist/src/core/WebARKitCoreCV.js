import _cv from '../../build/opencv_js';
export class WebARKitCoreCV {
    cv;
    version;
    BlurSize = 4;
    template_keypoints_vector;
    template_descriptors;
    corners;
    listeners;
    static async initCV() {
        const webarCV = new WebARKitCoreCV();
        return await webarCV._initialize();
    }
    async _initialize() {
        // Create an instance of the OpenCV Emscripten C++ code.
        this.cv = await _cv();
        console.log(this.cv);
        console.log("[WebARKitCoreCV]", "OpenCV initialized");
        this.version = '0.1.0';
        console.info("WebARKit ", this.version);
        setTimeout(() => {
            this.dispatchEvent({
                name: "loadWebARKitCoreCV",
                target: this,
            });
        }, 1);
        return this;
    }
    loadTrackables(msg) {
        console.log(this.cv);
        let src = msg.data;
        let refRows = msg.trackableHeight;
        let refCols = msg.trackableWidth;
        let mat = new this.cv.Mat(refRows, refCols, this.cv.CV_8UC4);
        mat.data.set(src.data);
        this.cv.cvtColor(mat, mat, this.cv.COLOR_RGBA2GRAY, 0);
        let ksize = new this.cv.Size(this.BlurSize, this.BlurSize);
        let anchor = new this.cv.Point(-1, -1);
        //cv.blur(mat, mat, ksize, anchor, cv.BORDER_DEFAULT);
        this.template_keypoints_vector = new this.cv.KeyPointVector();
        this.template_descriptors = new this.cv.Mat();
        let noArray = new this.cv.Mat();
        let orb = new this.cv.ORB(10000);
        orb.detectAndCompute(mat, noArray, this.template_keypoints_vector, this.template_descriptors);
        var cornersArray = new Float64Array(8);
        cornersArray[0] = 0;
        cornersArray[1] = 0;
        cornersArray[2] = refCols;
        cornersArray[3] = 0;
        cornersArray[4] = refCols;
        cornersArray[5] = refRows;
        cornersArray[6] = 0;
        cornersArray[7] = refRows;
        this.corners = new this.cv.matFromArray(2, 2, this.cv.CV_64FC2, cornersArray);
        mat.delete();
        noArray.delete();
        orb.delete();
    }
    ;
    /*dispatchEvent(event: any) {
      let listeners = this.listeners[event.name];
      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          listeners[i].call(this, event);
        }
      }
    }*/
    dispatchEvent(event) {
        let listeners = this.converter().listeners[event.name];
        if (listeners) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i].call(this, event);
            }
        }
    }
    converter() {
        return this;
    }
}
//# sourceMappingURL=WebARKitCoreCV.js.map