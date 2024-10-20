// @ts-ignore
import _cv from "../../build/opencv_js";

export class WebARKitCoreCV {
  private cv: any;
  private version: string;
  private BlurSize: number = 4;
  private template_keypoints_vector: any;
  private template_descriptors: any;
  private corners: any;
  private listeners: object;
  private ValidPointTotal = 15;
  private N = 10.0;
  private homography_transform: any;

  constructor() {
    this.listeners = {};
  }

  static async initCV() {
    const webarkitCoreCV = new WebARKitCoreCV();
    return await webarkitCoreCV._initialize();
  }

  async _initialize() {
    // Create an instance of the OpenCV Emscripten C++ code.
    this.cv = await _cv();

    console.log("[WebARKitCoreCV]", "OpenCV initialized");

    this.version = "4.7.0";
    console.info("WebARKitCoreCV ", this.version);

    setTimeout(() => {
      this.dispatchEvent({
        name: "loadWebARKitCoreCV",
        target: this,
      });
    }, 1);

    return this;
  }

  loadTrackables(msg: any) {
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

    orb.detectAndCompute(
      mat,
      noArray,
      this.template_keypoints_vector,
      this.template_descriptors,
    );

    var cornersArray = new Float64Array(8);

    cornersArray[0] = 0;
    cornersArray[1] = 0;
    cornersArray[2] = refCols;
    cornersArray[3] = 0;
    cornersArray[4] = refCols;
    cornersArray[5] = refRows;
    cornersArray[6] = 0;
    cornersArray[7] = refRows;

    this.corners = new this.cv.matFromArray(
      2,
      2,
      this.cv.CV_64FC2,
      cornersArray,
    );

    mat.delete();
    noArray.delete();
    orb.delete();
  }

  track(msg: any) {
    var result;
    const keyFrameImageData = msg.imagedata;
    console.log(keyFrameImageData)

    let src = new this.cv.Mat(msg.vHeight, msg.vWidth, this.cv.CV_8UC4);
    let gray = new this.cv.Mat(msg.vHeight, msg.vWidth, this.cv.CV_8UC1);

    src.data.set(keyFrameImageData);

    this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY, 0);
    console.log(gray)

    let ksize = new this.cv.Size(this.BlurSize, this.BlurSize);
    let anchor = new this.cv.Point(-1, -1);
    //cv.blur(src, src, ksize, anchor, cv.BORDER_DEFAULT);

    var frame_keypoints_vector = new this.cv.KeyPointVector();

    var frame_descriptors = new this.cv.Mat();

    var orb = new this.cv.ORB(10000);

    var noArray = new this.cv.Mat();

    orb.detectAndCompute(
      gray,
      noArray,
      frame_keypoints_vector,
      frame_descriptors,
    );

    var knnMatches = new this.cv.DMatchVectorVector();

    var matcher = new this.cv.BFMatcher();
    console.log("template_descriptors", this.template_descriptors);

    matcher.knnMatch(
      frame_descriptors,
      this.template_descriptors,
      knnMatches,
      2,
    );

    var frame_keypoints = [];

    var template_keypoints = [];

    var matchTotal = knnMatches.size();

    console.log("matchTotal: ", matchTotal);

    for (var i = 0; i < matchTotal; i++) {
      var point = knnMatches.get(i).get(0);
      var point2 = knnMatches.get(i).get(1);

      if (point.distance < 0.7 * point2.distance) {
        var frame_point = frame_keypoints_vector.get(point.queryIdx).pt;
        console.log(frame_point.x)
        //frame_keypoints.push(frame_point);
        frame_keypoints.push(frame_point.x);
        frame_keypoints.push(frame_point.y);

        var template_point = this.template_keypoints_vector.get(
          point.trainIdx,
        ).pt;

        //template_keypoints.push(template_point);
        template_keypoints.push(template_point.x);
        template_keypoints.push(template_point.y);
      }
    }
    console.log(template_keypoints)

    var frameMat = new this.cv.Mat(frame_keypoints.length, 1, this.cv.CV_32FC2);
    var templateMat = new this.cv.Mat(
      template_keypoints.length,
      1,
      this.cv.CV_32FC2,
    );

    frameMat.data32F.set(frame_keypoints)
    templateMat.data32F.set(template_keypoints)

    /*for (let i = 0; i < template_keypoints.length; i++) {
      frameMat.data32F[i * 2] = frame_keypoints[i].x;
      frameMat.data32F[i * 2 + 1] = frame_keypoints[i].y;

      templateMat.data32F[i * 2] = template_keypoints[i].x;
      templateMat.data32F[i * 2 + 1] = template_keypoints[i].y;
    }*/

    if (template_keypoints.length >= this.ValidPointTotal) {
      var homography = this.cv.findHomography(
          frameMat,
          templateMat,
          this.cv.RANSAC,
      );
      console.log("homograpy: ",homography);
      var valid;

      valid = this.homographyValid(homography);
      console.log(valid)

      if (this.homographyValid(homography) == true) {
          console.log('true')
          var out = this.fill_output(homography, valid);
          console.log("output from", out);
      }
      //this.homography_transform = homography.data64F;
      this.homography_transform = out.slice(0,9)
    } else {
      this.homography_transform = null;
    }

    noArray.delete();
    orb.delete();
    frame_keypoints_vector.delete();
    frame_descriptors.delete();
    knnMatches.delete();
    matcher.delete();
    templateMat.delete();
    frameMat.delete();
    src.delete();
    frame_keypoints = <any>(<unknown>null);
    template_keypoints = <any>(<unknown>null);

    console.log("Homography from orb detector: ", this.homography_transform);

    result = {
      type: "found",
      matrix: JSON.stringify(this.homography_transform),
    };
    return result;
  }

  homographyValid(H: any) {
    console.log(H.floatAt(0,0))
    const det =
      H.doubleAt(0, 0) * H.doubleAt(1, 1) - H.doubleAt(1, 0) * H.doubleAt(0, 1);
      //H.floatAt(0, 0) * H.floatAt(1, 1) - H.floatAt(1, 0) * H.floatAt(0, 1);

    return 1 / this.N < Math.abs(det) && Math.abs(det) < this.N;
  }

  fill_output = (H: any, valid: boolean) => {
    let output = new Float64Array(17);
    var warped = new this.cv.Mat(2, 2, this.cv.CV_64FC2);
    this.cv.perspectiveTransform(this.corners, warped, H);

    output[0] = H.doubleAt(0, 0);
    output[1] = H.doubleAt(0, 1);
    output[2] = H.doubleAt(0, 2);
    output[3] = H.doubleAt(1, 0);
    output[4] = H.doubleAt(1, 1);
    output[5] = H.doubleAt(1, 2);
    output[6] = H.doubleAt(2, 0);
    output[7] = H.doubleAt(2, 1);
    output[8] = H.doubleAt(2, 2);

    output[9] = warped.doubleAt(0, 0);
    output[10] = warped.doubleAt(0, 1);
    output[11] = warped.doubleAt(0, 2);
    output[12] = warped.doubleAt(0, 3);
    output[13] = warped.doubleAt(1, 0);
    output[14] = warped.doubleAt(1, 1);
    output[15] = warped.doubleAt(1, 2);
    output[16] = warped.doubleAt(1, 3);

    console.log(output);

    // corners.delete();
    // warped.delete();

    return output;
  };

  addEventListener(name: string, callback: object): void {
    if (!this.converter().listeners[name]) {
      this.converter().listeners[name] = [];
    }
    this.converter().listeners[name].push(callback);
  }

  dispatchEvent(event: { name: string; target: any; data?: object }): void {
    let listeners = this.converter().listeners[event.name];
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i].call(this, event);
      }
    }
  }

  private converter(): any {
    return this;
  }
}
