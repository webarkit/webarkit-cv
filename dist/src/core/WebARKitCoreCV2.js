// @ts-ignore
import _cv from "../../build/opencv_js";
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
        this.cv = await _cv();
        console.log("[WebARKitCoreCV]", "OpenCV initialized");
        this.version = "4.7.0";
        console.info("WebARKitCoreCV ", this.version);
        this.orb = new this.cv.ORB(1000); // And then immediately create an ORB
        console.log(this.orb);
        this.bfMatcher = new this.cv.BFMatcher(this.cv.NORM_HAMMING, true); // And at the same time the matcher
        this.memoryData = [];
        console.log(Object.keys(this.cv));
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
        const img = this.cv.matFromImageData(imageData);
        const imgGray = this.convertToGray(img);
        img.delete();
        const keypointsData = this.getImageKeypoints(imgGray);
        console.log(keypointsData);
        console.log("memoryData: ", this.memoryData);
        this.memoryData.push({ keypointsData });
        return { id: this.memoryData.length - 1 };
    }
    track(msg) {
        const imageData = new ImageData(new Uint8ClampedArray(msg.imagedata), msg.vWidth, msg.vHeight);
        return this.estimateCameraPosition({ id: 0, imageData: imageData });
    }
    estimateCameraPosition({ id, imageData }) {
        const img = this.cv.matFromImageData(imageData);
        const imgGray = this.convertToGray(img);
        img.delete();
        let finalImage = new this.cv.Mat();
        this.cv.cvtColor(imgGray, finalImage, this.cv.COLOR_GRAY2RGB);
        let queryPointsMat = null;
        let trainPointsMat = null;
        //console.log(memoryData[id])
        if (this.memoryData[id].trainPointsMat) {
            const nextPoints = new this.cv.Mat();
            const status = new this.cv.Mat();
            const errors = new this.cv.Mat();
            this.cv.calcOpticalFlowPyrLK(this.memoryData[id].lastFrame, imgGray, this.memoryData[id].trainPointsMat, nextPoints, status, errors);
            const filterArr = [];
            for (let i = 0; i < status.rows; i++)
                filterArr.push(status.charAt(i, 0) === 1 && errors.floatAt(i, 0) < 10);
            trainPointsMat = this.filter(nextPoints, filterArr);
            queryPointsMat = this.filter(this.memoryData[id].queryPointsMat, filterArr);
            status.delete();
            errors.delete();
            nextPoints.delete();
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
            const rvec = new this.cv.Mat();
            const tvec = new this.cv.Mat();
            const inliers = new this.cv.Mat();
            this.cv.solvePnPRansac(queryPointsMat, trainPointsMat, mtx, dist, rvec, tvec, false, 100, 5.0, 0.99, inliers);
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
                console.log('Tracking  !!!!');
                const result = {
                    type: "found",
                    matrix: JSON.stringify(projectionMatrix.data64F),
                    corners: JSON.stringify([]),
                    finalImage: this.imageDataFromMat(finalImage)
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
        const rows = arr.reduce((sum, flag) => flag ? sum + 1 : sum, 0);
        const newMat = new this.cv.Mat(rows, mat.cols, mat.type());
        let j = 0;
        for (let i = 0; i < mat.rows; i++) {
            if (arr[i])
                mat.row(i).copyTo(newMat.row(j++));
        }
        return newMat;
    }
    draw(finalImage, projectionMatrix) {
        const _axis = [
            0, 0, 0, 1,
            30, 0, 0, 1,
            0, 30, 0, 1,
            0, 0, -30, 1
        ];
        const axisT = this.cv.matFromArray(4, 4, this.cv.CV_64F, _axis);
        const axis = axisT.t();
        console.log(projectionMatrix);
        const pointsT = this.dot(projectionMatrix, axis);
        const points = pointsT.t();
        const pointsArr = [];
        for (let i = 0; i < 4; i++) {
            pointsArr.push({
                x: points.doubleAt(i, 0) / points.doubleAt(i, 2),
                y: points.doubleAt(i, 1) / points.doubleAt(i, 2)
            });
        }
        this.cv.line(finalImage, pointsArr[0], pointsArr[1], [255, 0, 0, 255], 2);
        this.cv.line(finalImage, pointsArr[0], pointsArr[2], [0, 255, 0, 255], 2);
        this.cv.line(finalImage, pointsArr[0], pointsArr[3], [0, 0, 255, 255], 2);
        axisT.delete();
        axis.delete();
        pointsT.delete();
        points.delete();
    }
    drawPoints(finalImage, mat) {
        for (let i = 0; i < mat.rows; i++) {
            this.cv.circle(finalImage, { x: mat.floatAt(i, 0), y: mat.floatAt(i, 1) }, 2, [0, 0, 255, 0]);
        }
    }
    getCameraMatrix(rows, cols) {
        const f = Math.hypot(cols, rows) / 2 / (Math.tan(this.angle / 2 * Math.PI / 180));
        //console.log(f)
        const _mtx = [
            f, 0, cols / 2,
            0, f, rows / 2,
            0, 0, 1
        ];
        const mtx = this.cv.matFromArray(3, 3, this.cv.CV_64F, _mtx);
        return mtx;
    }
    getDistortion() {
        const _dist = [0, 0, 0, 0];
        const dist = this.cv.matFromArray(1, _dist.length, this.cv.CV_64F, _dist);
        return dist;
    }
    matchKeypoints(queryImageData, trainImageData, threshold = 30) {
        const queryPoints = [];
        const trainPoints = [];
        const matches = new this.cv.DMatchVector();
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
                0
            ]);
            trainPoints.push([
                trainImageData.keypoints.get(good_matches[i].trainIdx).pt.x,
                trainImageData.keypoints.get(good_matches[i].trainIdx).pt.y
            ]);
        }
        const queryPointsMat = this.cv.matFromArray(queryPoints.length, 1, this.cv.CV_32FC3, queryPoints.flat());
        const trainPointsMat = this.cv.matFromArray(trainPoints.length, 1, this.cv.CV_32FC2, trainPoints.flat());
        matches.delete();
        return { queryPointsMat, trainPointsMat };
    }
    convertToGray(img) {
        const imgGray = new this.cv.Mat();
        this.cv.cvtColor(img, imgGray, this.cv.COLOR_BGR2GRAY);
        return imgGray;
    }
    dot(a, b) {
        const res = new this.cv.Mat;
        const zeros = this.cv.Mat.zeros(a.cols, b.rows, this.cv.CV_64F);
        this.cv.gemm(a, b, 1, zeros, 0, res);
        zeros.delete();
        return res;
    }
    getProjectionMatrix(rvec, tvec, mtx) {
        const rotationMatrix = new this.cv.Mat();
        this.cv.Rodrigues(rvec, rotationMatrix);
        const extrinsicMatrix = new this.cv.Mat(3, 4, this.cv.CV_64F);
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
        const keypoints = new this.cv.KeyPointVector(); // key points
        const none = new this.cv.Mat();
        const descriptors = new this.cv.Mat(); // Point descriptors (i.e. some unique value)
        this.orb.detectAndCompute(image, none, keypoints, descriptors);
        none.delete();
        const dispose = () => {
            keypoints.delete();
            descriptors.delete();
        };
        return { image, keypoints, descriptors, delete: dispose };
    }
    imageDataFromMat(mat) {
        // converts the mat type to this.cv.CV_8U
        const img = new this.cv.Mat();
        const depth = mat.type() % 8;
        const scale = depth <= this.cv.CV_8S ? 1.0 : depth <= this.cv.CV_32S ? 1.0 / 256.0 : 255.0;
        const shift = depth === this.cv.CV_8S || depth === this.cv.CV_16S ? 128.0 : 0.0;
        mat.convertTo(img, this.cv.CV_8U, scale, shift);
        // converts the img type to cv.CV_8UC4
        switch (img.type()) {
            case this.cv.CV_8UC1:
                this.cv.cvtColor(img, img, this.cv.COLOR_GRAY2RGBA);
                break;
            case this.cv.CV_8UC3:
                this.cv.cvtColor(img, img, this.cv.COLOR_RGB2RGBA);
                break;
            case this.cv.CV_8UC4:
                break;
            default:
                throw new Error('Bad number of channels (Source image must have 1, 3 or 4 channels)');
        }
        const clampedArray = new ImageData(new Uint8ClampedArray(img.data), img.cols, img.rows);
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
//# sourceMappingURL=WebARKitCoreCV2.js.map