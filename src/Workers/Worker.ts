import cv from "../../build/opencv_js";
const ctx: Worker = self as any;

const initCV = async () => {
  return await cv();
};

var opencv: any;

opencv = initCV();

ctx.onmessage = (e: MessageEvent<any>) => {
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

var corners: Array<object> = [];

const loadTrackables = async (msg: any) => {
  opencv.then((cv: any) => {
    let src = msg.data;
    let refRows = msg.trackableHeight;
    let refCols = msg.trackableWidth;
    let mat = new cv.matFromArray(refRows, refCols, cv.CV_8UC4, src);

    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);

    let ksize = new cv.Size(BlurSize, BlurSize);
    let anchor = new cv.Point(-1, -1);
    cv.blur(mat, mat, ksize, anchor, cv.BORDER_DEFAULT);
    template_keypoints_vector = new cv.KeyPointVector();

    template_descriptors = new cv.Mat();

    let noArray = new cv.Mat();

    let orb = new cv.ORB(3000);

    orb.detectAndCompute(
      mat,
      noArray,
      template_keypoints_vector,
      template_descriptors
    );

    corners[0] = new cv.Point(0, 0);
    corners[1] = new cv.Point(refCols, 0);
    corners[2] = new cv.Point(refCols, refRows);
    corners[3] = new cv.Point(0, refRows);

    mat.delete();
    noArray.delete();
    orb.delete();
  });
};
