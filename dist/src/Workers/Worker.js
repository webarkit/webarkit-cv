import cv from "../../build/opencv_js";
const ctx = self;
const initCV = async () => {
    return new Promise((resolve, reject) => {
        resolve(cv());
    });
};
var opencv;
opencv = initCV();
var next;
let markerResult = null;
ctx.onmessage = (e) => {
    const msg = e.data;
    switch (msg.type) {
        case "loadTrackables": {
            loadTrackables(msg);
            return;
        }
        case "process": {
            next = msg.imagedata;
            process(msg);
        }
    }
};
const ValidPointTotal = 15;
const BlurSize = 4;
var template_keypoints_vector;
var template_descriptors;
var homography_transform;
var corners = [];
const loadTrackables = async (msg) => {
    var cv = await opencv;
    let src = msg.data;
    let refRows = msg.trackableHeight;
    let refCols = msg.trackableWidth;
    let mat = new cv.Mat(refRows, refCols, cv.CV_8UC4);
    mat.data.set(src.data);
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
    let ksize = new cv.Size(BlurSize, BlurSize);
    let anchor = new cv.Point(-1, -1);
    //cv.blur(mat, mat, ksize, anchor, cv.BORDER_DEFAULT);
    template_keypoints_vector = new cv.KeyPointVector();
    template_descriptors = new cv.Mat();
    let noArray = new cv.Mat();
    let orb = new cv.ORB(10000);
    orb.detectAndCompute(mat, noArray, template_keypoints_vector, template_descriptors);
    corners[0] = new cv.Point(0, 0);
    corners[1] = new cv.Point(refCols, 0);
    corners[2] = new cv.Point(refCols, refRows);
    corners[3] = new cv.Point(0, refRows);
    mat.delete();
    noArray.delete();
    orb.delete();
};
const process = async (msg) => {
    // markerResult = null;
    markerResult = await track(msg);
    if (markerResult != null) {
        ctx.postMessage(markerResult);
    }
    else {
        ctx.postMessage({ type: "not found" });
    }
    next = null;
};
const track = async (msg) => {
    var result;
    var cv = await opencv;
    const keyFrameImageData = msg.imagedata;
    let src = new cv.Mat(msg.vHeight, msg.vWidth, cv.CV_8UC4);
    src.data.set(keyFrameImageData);
    console.log(src);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
    let ksize = new cv.Size(BlurSize, BlurSize);
    let anchor = new cv.Point(-1, -1);
    //cv.blur(src, src, ksize, anchor, cv.BORDER_DEFAULT);
    var frame_keypoints_vector = new cv.KeyPointVector();
    var frame_descriptors = new cv.Mat();
    var orb = new cv.ORB(10000);
    var noArray = new cv.Mat();
    orb.detectAndCompute(src, noArray, frame_keypoints_vector, frame_descriptors);
    var knnMatches = new cv.DMatchVectorVector();
    var matcher = new cv.BFMatcher();
    matcher.knnMatch(frame_descriptors, template_descriptors, knnMatches, 2);
    var frame_keypoints = [];
    var template_keypoints = [];
    var matchTotal = knnMatches.size();
    //console.log("matchTotal: ", matchTotal);
    for (var i = 0; i < matchTotal; i++) {
        var point = knnMatches.get(i).get(0);
        var point2 = knnMatches.get(i).get(1);
        if (point.distance < 0.7 * point2.distance) {
            var frame_point = frame_keypoints_vector.get(point.queryIdx).pt;
            frame_keypoints.push(frame_point);
            var template_point = template_keypoints_vector.get(point.trainIdx).pt;
            template_keypoints.push(template_point);
        }
    }
    var frameMat = new cv.Mat(frame_keypoints.length, 1, cv.CV_32FC2);
    var templateMat = new cv.Mat(template_keypoints.length, 1, cv.CV_32FC2);
    for (let i = 0; i < template_keypoints.length; i++) {
        frameMat.data32F[i * 2] = frame_keypoints[i].x;
        frameMat.data32F[i * 2 + 1] = frame_keypoints[i].y;
        templateMat.data32F[i * 2] = template_keypoints[i].x;
        templateMat.data32F[i * 2 + 1] = template_keypoints[i].y;
    }
    if (template_keypoints.length >= ValidPointTotal) {
        var homography = cv.findHomography(templateMat, frameMat, cv.RANSAC);
        homography_transform = homography.data64F;
    }
    else {
        homography_transform = null;
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
    frame_keypoints = null;
    template_keypoints = null;
    console.log("Homography from orb detector: ", homography_transform);
    result = { type: "found", matrix: JSON.stringify(homography_transform) };
    return result;
};
//# sourceMappingURL=Worker.js.map