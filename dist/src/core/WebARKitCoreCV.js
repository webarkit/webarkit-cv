// @ts-ignore
// @ts-nocheck
//import _cv from "../../build/opencv_js";
import { cv2, waitCV } from "./opencv-helper";
export class WebARKitCoreCV {
    cv;
    version;
    orb;
    bfMatcher;
    memoryData;
    angle = 45;
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
        //cv2 = await _cv();
        await waitCV();
        console.log("[WebARKitCoreCV]", "OpenCV initialized");
        this.version = "4.7.0";
        console.info("WebARKitCoreCV ", this.version);
        //@ts-ignore
        this.orb = new cv2.ORB(1000); // And then immediately create an ORB
        //@ts-ignore
        this.bfMatcher = new cv2.BFMatcher(cv2.NORM_HAMMING, true); // And at the same time the matcher
        this.memoryData = [];
        console.log(Object.keys(cv2));
        setTimeout(() => {
            this.dispatchEvent({
                name: "loadWebARKitCoreCV",
                target: this,
            });
        }, 1);
        return this;
    }
    loadTrackables(msg) {
        this.loadSourceImage(msg.data);
    }
    loadSourceImage(imageData) {
        //@ts-ignore
        const img = cv2.matFromImageData(imageData);
        const imgGray = this.convertToGray(img);
        img.delete();
        const keypointsData = this.getImageKeypoints(imgGray);
        // console.log(keypointsData);
        // console.log("memoryData: ", this.memoryData);
        this.memoryData.push({ keypointsData });
        return { id: this.memoryData.length - 1 };
    }
    track(msg) {
        // console.log("Tracking...", msg);
        if (!msg.imagedata) {
            return;
        }
        const id = Number.isInteger(msg.id) && msg.id >= 0 ? msg.id : 0;
        const memory = this.memoryData[id];
        if (!memory) {
            // eslint-disable-next-line no-console
            console.warn(`Received tracking data for id ${id}, but memoryData has no entry. Skipping frame.`, { availableIds: this.memoryData.map((_, idx) => idx) });
            return;
        }
        //console.log("msg-imagedata while Tracking...", msg.imagedata);
        //console.log("width and height from msg: ", msg.vWidth, msg.vHeight);
        // Use provided video width/height (sent by the main thread). Previously
        // this was hard-coded to 320x240 which causes ImageData construction to
        // throw if the buffer length doesn't match. Fall back to 320x240 when
        // values are missing.
        const width = Number.isFinite(msg.vWidth) ? msg.vWidth : 320;
        const height = Number.isFinite(msg.vHeight) ? msg.vHeight : 240;
        const buf = new Uint8ClampedArray(msg.imagedata);
        const expectedLen = 4 * width * height;
        // Strict validation: don't silently slice/pad mismatched buffers. If the
        // buffer length doesn't match the expected 4*width*height, log an error
        // and abort processing this frame. This makes debugging easier and avoids
        // silently corrupting frames.
        if (buf.length !== expectedLen) {
            // eslint-disable-next-line no-console
            console.error(`ImageData buffer length (${buf.length}) does not match 4*width*height (${expectedLen}).`, { bufLen: buf.length, width, height });
            // Clear memory/state for this id to avoid reusing possibly invalid mats
            // on subsequent frames and bail out.
            this.clearMemory(memory);
            return;
        }
        const imageData = new ImageData(buf, width, height);
        return this.estimateCameraPosition({ id, imageData });
    }
    estimateCameraPosition({ id, imageData, }) {
        //@ts-ignore
        const img = cv2.matFromImageData(imageData);
        const imgGray = this.convertToGray(img);
        img.delete();
        //@ts-ignore
        let finalImage = new cv2.Mat();
        //@ts-ignore
        cv2.cvtColor(imgGray, finalImage, cv2.COLOR_GRAY2RGB);
        let queryPointsMat = null;
        let trainPointsMat = null;
        //console.log(memoryData[id])
        // Use calcOpticalFlowPyrLK only when we have both the previous frame and
        // train points available. Guard and catch errors so we don't pass
        // undefined into the wasm binding (which causes toWireType errors).
        if (this.memoryData[id].trainPointsMat && this.memoryData[id].lastFrame) {
            /*@ts-ignore*/
            const nextPoints = new cv2.Mat();
            const status = new cv2.Mat();
            const errors = new cv2.Mat();
            try {
                cv2.calcOpticalFlowPyrLK(this.memoryData[id].lastFrame, imgGray, this.memoryData[id].trainPointsMat, nextPoints, status, errors);
                const filterArr = [];
                for (let i = 0; i < status.rows; i++)
                    filterArr.push(status.charAt(i, 0) === 1 && errors.floatAt(i, 0) < 10);
                trainPointsMat = this.filter(nextPoints, filterArr);
                queryPointsMat = this.filter(this.memoryData[id].queryPointsMat, filterArr);
            }
            catch (err) {
                // Log helpful diagnostic info and clear memory so we fall back to
                // descriptor-based matching on the next iteration instead of crashing.
                // eslint-disable-next-line no-console
                console.warn("calcOpticalFlowPyrLK failed, skipping optical flow:", err, {
                    lastFrame: this.memoryData[id].lastFrame,
                    trainPointsMat: this.memoryData[id].trainPointsMat,
                });
                // ensure we don't leak the Mats we created
                try {
                    status.delete();
                }
                catch (e) { }
                try {
                    errors.delete();
                }
                catch (e) { }
                try {
                    nextPoints.delete();
                }
                catch (e) { }
                // Reset stored tracking mats to force a fresh keypoint matching next
                // frame. This avoids repeatedly calling calcOpticalFlow with invalid
                // internal state.
                this.clearMemory(this.memoryData[id]);
            }
            try {
                status.delete();
            }
            catch (e) { }
            try {
                errors.delete();
            }
            catch (e) { }
            try {
                nextPoints.delete();
            }
            catch (e) { }
        }
        if (!trainPointsMat) {
            //console.log('train points false...')
            const queryImageData = this.memoryData[id].keypointsData;
            const trainImageData = this.getImageKeypoints(imgGray);
            const a = this.matchKeypoints(queryImageData, trainImageData, 50);
            queryPointsMat = a.queryPointsMat;
            trainPointsMat = a.trainPointsMat;
            trainImageData.delete();
        }
        const k = this.memoryData[id].trainPointsMat ? 0.6 : 1;
        if (trainPointsMat && trainPointsMat.rows > 12 * k) {
            const mtx = this.getCameraMatrix(imgGray.rows, imgGray.cols);
            const dist = this.getDistortion();
            const rvec = new cv2.Mat();
            const tvec = new cv2.Mat();
            const inliers = new cv2.Mat();
            cv2.solvePnPRansac(queryPointsMat, trainPointsMat, mtx, dist, rvec, tvec, false, 100, 5.0, 0.99, inliers);
            if (inliers.rows / trainPointsMat.rows > 0.2 * k) {
                const projectionMatrix = this.getProjectionMatrix(rvec, tvec, mtx);
                const filterArr = this.generateFilterArr(queryPointsMat.rows);
                for (let i = 0; i < inliers.rows; i++)
                    filterArr[inliers.intAt(i, 0)] = true;
                this.clearMemory(this.memoryData[id]);
                this.memoryData[id].queryPointsMat = this.filter(queryPointsMat, filterArr);
                this.memoryData[id].trainPointsMat = this.filter(trainPointsMat, filterArr);
                this.draw(finalImage, projectionMatrix);
                this.drawPoints(finalImage, trainPointsMat);
                console.log("Tracking  !!!!");
                const result = {
                    type: "found",
                    matrix: JSON.stringify(projectionMatrix.data64F),
                    corners: JSON.stringify([]),
                    finalImage: this.imageDataFromMat(finalImage),
                };
                projectionMatrix.delete();
                return result;
            }
            else
                this.clearMemory(this.memoryData[id]);
            mtx.delete();
            dist.delete();
            rvec.delete();
            tvec.delete();
            inliers.delete();
        }
        else
            this.clearMemory(this.memoryData[id]);
        if (queryPointsMat)
            queryPointsMat.delete();
        if (trainPointsMat)
            trainPointsMat.delete();
        if (this.memoryData[id].lastFrame)
            this.memoryData[id].lastFrame.delete();
        this.memoryData[id].lastFrame = imgGray;
        return this.imageDataFromMat(finalImage);
    }
    clearMemory(memory) {
        if (memory.queryPointsMat)
            memory.queryPointsMat.delete();
        if (memory.trainPointsMat)
            memory.trainPointsMat.delete();
        memory.trainPointsMat = null;
        memory.queryPointsMat = null;
    }
    // Just functions to keep the code clean
    generateFilterArr(rows) {
        const arr = [];
        for (let i = 0; i < rows; i++)
            arr.push(false);
        return arr;
    }
    // Filtering out Mat
    filter(mat, arr) {
        const rows = arr.reduce((sum, flag) => (flag ? sum + 1 : sum), 0);
        const newMat = new cv2.Mat(rows, mat.cols, mat.type());
        let j = 0;
        for (let i = 0; i < mat.rows; i++) {
            if (arr[i])
                mat.row(i).copyTo(newMat.row(j++));
        }
        return newMat;
    }
    draw(finalImage, projectionMatrix) {
        const _axis = [0, 0, 0, 1, 30, 0, 0, 1, 0, 30, 0, 1, 0, 0, -30, 1];
        const axisT = cv2.matFromArray(4, 4, cv2.CV_64F, _axis);
        const axis = axisT.t();
        // console.log(projectionMatrix);
        const pointsT = this.dot(projectionMatrix, axis);
        const points = pointsT.t();
        const pointsArr = [];
        for (let i = 0; i < 4; i++) {
            pointsArr.push({
                x: points.doubleAt(i, 0) / points.doubleAt(i, 2),
                y: points.doubleAt(i, 1) / points.doubleAt(i, 2),
            });
        }
        cv2.line(finalImage, pointsArr[0], pointsArr[1], [255, 0, 0, 255], 2);
        cv2.line(finalImage, pointsArr[0], pointsArr[2], [0, 255, 0, 255], 2);
        cv2.line(finalImage, pointsArr[0], pointsArr[3], [0, 0, 255, 255], 2);
        axisT.delete();
        axis.delete();
        pointsT.delete();
        points.delete();
    }
    drawPoints(finalImage, mat) {
        for (let i = 0; i < mat.rows; i++) {
            cv2.circle(finalImage, { x: mat.floatAt(i, 0), y: mat.floatAt(i, 1) }, 2, [0, 0, 255, 0]);
        }
    }
    getCameraMatrix(rows, cols) {
        const f = Math.hypot(cols, rows) / 2 / Math.tan(((this.angle / 2) * Math.PI) / 180);
        //console.log(f)
        const _mtx = [f, 0, cols / 2, 0, f, rows / 2, 0, 0, 1];
        return cv2.matFromArray(3, 3, cv2.CV_64F, _mtx);
    }
    getDistortion() {
        const _dist = [0, 0, 0, 0];
        return cv2.matFromArray(1, _dist.length, cv2.CV_64F, _dist);
    }
    matchKeypoints(queryImageData, trainImageData, threshold = 30) {
        const queryPoints = [];
        const trainPoints = [];
        const matches = new cv2.DMatchVector();
        if (trainImageData.keypoints.size() > 5)
            //console.log(trainImageData.keypoints.size())
            this.bfMatcher.match(queryImageData.descriptors, trainImageData.descriptors, matches);
        const good_matches = [];
        for (let i = 0; i < matches.size(); i++) {
            if (matches.get(i).distance < threshold)
                good_matches.push(matches.get(i));
        }
        for (let i = 0; i < good_matches.length; i++) {
            queryPoints.push([
                queryImageData.keypoints.get(good_matches[i].queryIdx).pt.x,
                queryImageData.keypoints.get(good_matches[i].queryIdx).pt.y,
                0,
            ]);
            trainPoints.push([
                trainImageData.keypoints.get(good_matches[i].trainIdx).pt.x,
                trainImageData.keypoints.get(good_matches[i].trainIdx).pt.y,
            ]);
        }
        const queryPointsMat = cv2.matFromArray(queryPoints.length, 1, cv2.CV_32FC3, queryPoints.flat());
        const trainPointsMat = cv2.matFromArray(trainPoints.length, 1, cv2.CV_32FC2, trainPoints.flat());
        matches.delete();
        return { queryPointsMat, trainPointsMat };
    }
    convertToGray(img) {
        const imgGray = new cv2.Mat();
        cv2.cvtColor(img, imgGray, cv2.COLOR_BGR2GRAY);
        return imgGray;
    }
    dot(a, b) {
        const res = new cv2.Mat();
        const zeros = cv2.Mat.zeros(a.cols, b.rows, cv2.CV_64F);
        cv2.gemm(a, b, 1, zeros, 0, res);
        zeros.delete();
        return res;
    }
    getProjectionMatrix(rvec, tvec, mtx) {
        const rotationMatrix = new cv2.Mat();
        cv2.Rodrigues(rvec, rotationMatrix);
        const extrinsicMatrix = new cv2.Mat(3, 4, cv2.CV_64F);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                extrinsicMatrix.doublePtr(i, j)[0] = rotationMatrix.doubleAt(i, j);
            }
            extrinsicMatrix.doublePtr(i, 3)[0] = tvec.doubleAt(i, 0);
        }
        const projectionMatrix = this.dot(mtx, extrinsicMatrix);
        extrinsicMatrix.delete();
        rotationMatrix.delete();
        return projectionMatrix;
    }
    getImageKeypoints(image) {
        const keypoints = new cv2.KeyPointVector(); // key points
        const none = new cv2.Mat();
        const descriptors = new cv2.Mat(); // Point descriptors (i.e. some unique value)
        this.orb.detectAndCompute(image, none, keypoints, descriptors);
        none.delete();
        const dispose = () => {
            keypoints.delete();
            descriptors.delete();
        };
        return { image, keypoints, descriptors, delete: dispose };
    }
    imageDataFromMat(mat) {
        // converts the mat type to cv2.CV_8U
        const img = new cv2.Mat();
        const depth = mat.type() % 8;
        const scale = depth <= cv2.CV_8S ? 1.0 : depth <= cv2.CV_32S ? 1.0 / 256.0 : 255.0;
        const shift = depth === cv2.CV_8S || depth === cv2.CV_16S ? 128.0 : 0.0;
        mat.convertTo(img, cv2.CV_8U, scale, shift);
        // converts the img type to cv.CV_8UC4
        switch (img.type()) {
            case cv2.CV_8UC1:
                cv2.cvtColor(img, img, cv2.COLOR_GRAY2RGBA);
                break;
            case cv2.CV_8UC3:
                cv2.cvtColor(img, img, cv2.COLOR_RGB2RGBA);
                break;
            case cv2.CV_8UC4:
                break;
            default:
                throw new Error("Bad number of channels (Source image must have 1, 3 or 4 channels)");
        }
        const channels = img.channels ? img.channels() : 4;
        const length = Math.max(0, img.cols * img.rows * channels);
        const view = new Uint8Array(img.data.buffer, img.data.byteOffset, length);
        const copy = new Uint8ClampedArray(length);
        copy.set(view);
        const clampedArray = new ImageData(copy, img.cols, img.rows);
        img.delete();
        mat.delete();
        return clampedArray;
    }
    homographyValid(H) {
        const det = H.doubleAt(0, 0) * H.doubleAt(1, 1) - H.doubleAt(1, 0) * H.doubleAt(0, 1);
        //H.floatAt(0, 0) * H.floatAt(1, 1) - H.floatAt(1, 0) * H.floatAt(0, 1);
        return 1 / this.N < Math.abs(det) && Math.abs(det) < this.N;
    }
    fill_output = (H, valid) => {
        let output = new Float64Array(17);
        let warped = new cv2.Mat(2, 2, cv2.CV_64FC2);
        cv2.perspectiveTransform(this.corners, warped, H);
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