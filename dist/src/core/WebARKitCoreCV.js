// @ts-ignore
import _cv from "../../build/opencv_js";
export class WebARKitCoreCV {
    cv;
    version;
    BlurSize = 4;
    template_keypoints_vector;
    template_descriptors;
    corners;
    corners_out;
    listeners;
    ValidPointTotal = 15;
    N = 10.0;
    homography_transform;
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
    loadTrackables(msg) {
        console.log(this.cv);
        let src = msg.data;
        let refRows = msg.trackableHeight;
        let refCols = msg.trackableWidth;
        let mat = new this.cv.Mat(refRows, refCols, this.cv.CV_8UC4);
        let grayImage = new this.cv.Mat(refRows, refCols, this.cv.CV_8UC1);
        mat.data.set(src.data);
        this.cv.cvtColor(mat, grayImage, this.cv.COLOR_RGBA2GRAY);
        let ksize = new this.cv.Size(this.BlurSize, this.BlurSize);
        let anchor = new this.cv.Point(-1, -1);
        //cv.blur(mat, mat, ksize, anchor, cv.BORDER_DEFAULT);
        this.template_keypoints_vector = new this.cv.KeyPointVector();
        this.template_descriptors = new this.cv.Mat();
        let noArray = new this.cv.Mat();
        let orb = new this.cv.ORB(10000);
        orb.detectAndCompute(grayImage, noArray, this.template_keypoints_vector, this.template_descriptors);
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
    track(msg) {
        var result;
        const keyFrameImageData = msg.imagedata;
        let src = new this.cv.Mat(msg.vHeight, msg.vWidth, this.cv.CV_8UC4);
        let gray = new this.cv.Mat(msg.vHeight, msg.vWidth, this.cv.CV_8UC1);
        src.data.set(keyFrameImageData);
        this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);
        console.log(gray);
        let ksize = new this.cv.Size(this.BlurSize, this.BlurSize);
        let anchor = new this.cv.Point(-1, -1);
        //cv.blur(src, src, ksize, anchor, cv.BORDER_DEFAULT);
        var frame_keypoints_vector = new this.cv.KeyPointVector();
        var frame_descriptors = new this.cv.Mat();
        var orb = new this.cv.ORB(10000);
        var noArray = new this.cv.Mat();
        orb.detectAndCompute(gray, noArray, frame_keypoints_vector, frame_descriptors);
        var knnMatches = new this.cv.DMatchVectorVector();
        let good_matches = new this.cv.DMatchVector();
        var matcher = new this.cv.BFMatcher();
        console.log("template_descriptors", this.template_descriptors);
        matcher.knnMatch(frame_descriptors, this.template_descriptors, knnMatches, 2);
        var knnDistance_option = 0.7; // distance ratio threshold
        /*var frame_keypoints = [];
    
        var template_keypoints = [];
    
        var matchTotal = knnMatches.size();
    
        console.log("matchTotal: ", matchTotal);
    
        for (var i = 0; i < matchTotal; i++) {
          var point = knnMatches.get(i).get(0);
          var point2 = knnMatches.get(i).get(1);
    
          if (point.distance < 0.7 * point2.distance) {
            var frame_point = frame_keypoints_vector.get(point.queryIdx).pt;
    
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
        }*/
        let counter = 0;
        for (let i = 0; i < knnMatches.size(); ++i) {
            let match = knnMatches.get(i);
            let dMatch1 = match.get(0);
            let dMatch2 = match.get(1);
            //console.log("[", i, "] ", "dMatch1: ", dMatch1, "dMatch2: ", dMatch2);
            if (dMatch1.distance <= dMatch2.distance * knnDistance_option) {
                //console.log("***Good Match***", "dMatch1.distance: ", dMatch1.distance, "was less than or = to: ", "dMatch2.distance * parseFloat(knnDistance_option)", dMatch2.distance * parseFloat(knnDistance_option), "dMatch2.distance: ", dMatch2.distance, "knnDistance", knnDistance_option);
                good_matches.push_back(dMatch1);
                counter++;
            }
        }
        console.log("keeping ", counter, " points in good_matches vector out of ", knnMatches.size(), " contained in this match vector:", knnMatches);
        console.log("here are first 5 matches");
        for (let t = 0; t < knnMatches.size(); ++t) {
            console.log("[" + t + "]", "matches: ", knnMatches.get(t));
            if (t === 5) {
                break;
            }
        }
        console.log("here are first 5 good_matches");
        for (let r = 0; r < good_matches.size(); ++r) {
            console.log("[" + r + "]", "good_matches: ", good_matches.get(r));
            if (r === 5) {
                break;
            }
        }
        /*var frameMat = new this.cv.Mat(frame_keypoints.length/2, 1, this.cv.CV_32FC2);
        var templateMat = new this.cv.Mat(
          template_keypoints.length/2,
          1,
          this.cv.CV_32FC2,
        );
    
        frameMat.data32F.set(frame_keypoints)
        templateMat.data32F.set(template_keypoints)*/
        let points1 = [];
        let points2 = [];
        /*for (let i = 0; i < good_matches.size(); i++) {
            points1.push(keypoints1.get(good_matches.get(i).queryIdx).pt);
            points2.push(keypoints2.get(good_matches.get(i).trainIdx).pt);
        }*/
        for (let i = 0; i < good_matches.size(); i++) {
            points1.push(frame_keypoints_vector.get(good_matches.get(i).queryIdx).pt.x);
            points1.push(frame_keypoints_vector.get(good_matches.get(i).queryIdx).pt.y);
            points2.push(this.template_keypoints_vector.get(good_matches.get(i).trainIdx).pt.x);
            points2.push(this.template_keypoints_vector.get(good_matches.get(i).trainIdx).pt.y);
        }
        console.log("points1:", points1, "points2:", points2);
        //59            Find homography
        //60            h = findHomography( points1, points2, RANSAC );
        //let mat1 = cv.matFromArray(points1.length, 2, cv.CV_32F, points1);
        //let mat2 = cv.matFromArray(points2.length, 2, cv.CV_32F, points2); //32FC2
        var mat1 = new this.cv.Mat(points1.length / 2, 1, this.cv.CV_32FC2);
        mat1.data32F.set(points1);
        var mat2 = new this.cv.Mat(points2.length / 2, 1, this.cv.CV_32FC2);
        mat2.data32F.set(points2);
        console.log("mat1: ", mat1, "mat2: ", mat2);
        /*for (let i = 0; i < template_keypoints.length; i++) {
          frameMat.data32F[i * 2] = frame_keypoints[i].x;
          frameMat.data32F[i * 2 + 1] = frame_keypoints[i].y;
    
          templateMat.data32F[i * 2] = template_keypoints[i].x;
          templateMat.data32F[i * 2 + 1] = template_keypoints[i].y;
        }*/
        //if (template_keypoints.length >= this.ValidPointTotal) {
        if (points2.length >= this.ValidPointTotal) {
            /*var homography = this.cv.findHomography(
                frameMat,
                templateMat,
                this.cv.RANSAC,
            );*/
            let homography = this.cv.findHomography(mat1, mat2, this.cv.RANSAC);
            console.log("homograpy: ", homography);
            var valid;
            valid = this.homographyValid(homography);
            console.log(valid);
            //if (this.homographyValid(homography) == true) {
            var out = this.fill_output(homography, valid);
            console.log("output from", out);
            //}
            //this.homography_transform = homography.data64F;
            this.homography_transform = out.slice(0, 9);
            this.corners_out = out.slice(9, 18);
        }
        else {
            this.homography_transform = null;
            this.corners_out = null;
        }
        noArray.delete();
        orb.delete();
        frame_keypoints_vector.delete();
        frame_descriptors.delete();
        knnMatches.delete();
        matcher.delete();
        //templateMat.delete();
        //frameMat.delete();
        mat1.delete();
        mat2.delete();
        src.delete();
        //frame_keypoints = <any>(<unknown>null);
        //template_keypoints = <any>(<unknown>null);
        console.log("Homography from orb detector: ", this.homography_transform);
        result = {
            type: "found",
            matrix: JSON.stringify(this.homography_transform),
            corners: JSON.stringify(this.corners_out),
        };
        return result;
    }
    homographyValid(H) {
        const det = H.doubleAt(0, 0) * H.doubleAt(1, 1) - H.doubleAt(1, 0) * H.doubleAt(0, 1);
        //H.floatAt(0, 0) * H.floatAt(1, 1) - H.floatAt(1, 0) * H.floatAt(0, 1);
        return 1 / this.N < Math.abs(det) && Math.abs(det) < this.N;
    }
    fill_output = (H, valid) => {
        let output = new Float64Array(17);
        let warped = new this.cv.Mat(2, 2, this.cv.CV_64FC2);
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
        H.delete();
        warped.delete();
        return output;
    };
    addEventListener(name, callback) {
        if (!this.converter().listeners[name]) {
            this.converter().listeners[name] = [];
        }
        this.converter().listeners[name].push(callback);
    }
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