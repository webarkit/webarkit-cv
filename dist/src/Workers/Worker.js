import cv from '../../build/opencv_js';
const ctx = self;
ctx.onmessage = (e) => {
    const msg = e.data;
    switch (msg.type) {
        case "loadTrackables": {
            loadTrackables(msg);
            return;
        }
    }
};
const ValidPointTotal = 15;
const BlurSize = 4;
var template_keypoints_vector;
var template_descriptors;
var homography_transform;
var corners = [];
var opencv;
const loadTrackables = async (msg) => {
    opencv = await cv();
    let src = msg.data;
    let refRows = msg.trackableHeight;
    let refCols = msg.trackableWidth;
    let mat = new opencv.matFromArray(refRows, refCols, opencv.CV_8UC4, src);
    opencv.cvtColor(mat, mat, opencv.COLOR_RGBA2GRAY, 0);
    let ksize = new opencv.Size(BlurSize, BlurSize);
    let anchor = new opencv.Point(-1, -1);
    opencv.blur(mat, mat, ksize, anchor, opencv.BORDER_DEFAULT);
    template_keypoints_vector = new opencv.KeyPointVector();
    template_descriptors = new opencv.Mat();
    let noArray = new opencv.Mat();
    let orb = new opencv.ORB(3000);
    orb.detectAndCompute(mat, noArray, template_keypoints_vector, template_descriptors);
    corners[0] = new opencv.Point(0, 0);
    corners[1] = new opencv.Point(refCols, 0);
    corners[2] = new opencv.Point(refCols, refRows);
    corners[3] = new opencv.Point(0, refRows);
    mat.delete();
    noArray.delete();
    orb.delete();
};
//# sourceMappingURL=Worker.js.map