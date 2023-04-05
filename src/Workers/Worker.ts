import cv from "../../build/opencv_js";
const ctx: Worker = self as any;

const initCV = async () => {
  return new Promise((resolve, reject) => {
    resolve(cv());
  });
};

var opencv: any;
opencv = initCV();

var next;
let markerResult: any = null;

ctx.onmessage = (e: MessageEvent<any>) => {
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

const N = 10;

const BlurSize = 4;

var template_keypoints_vector: any;

var template_descriptors: any;

var homography_transform;

var corners: any;

const loadTrackables = async (msg: any) => {
  var cv = await opencv;
  console.log(cv);
  
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

  orb.detectAndCompute(
    mat,
    noArray,
    template_keypoints_vector,
    template_descriptors
  );

  corners =  new cv.Mat(4, 4, cv.CV_64FC2);

  corners[0] = 0;
  corners[1] = 0;
  corners[2] = refCols;
  corners[3] = 0;
  corners[4] = refCols;
  corners[5] = refRows;
  corners[6] = 0;
  corners[7] = refRows;

  /*corners[0] = new cv.Point(0, 0);
  corners[1] = new cv.Point(refCols, 0);
  corners[2] = new cv.Point(refCols, refRows);
  corners[3] = new cv.Point(0, refRows);*/

  mat.delete();
  noArray.delete();
  orb.delete();
};

const homographyValid = (H: any) => {
  //const double det = H.at<double>(0,0)*H.at<double>(1,1)-H.at<double>(1,0)*H.at<double>(0,1);
  const  det = H.doubleAt(0, 0)*H.doubleAt(1,1)-H.doubleAt(1,0)*H.doubleAt(0,1);
  console.log(det);
  
  return (1/N < Math.abs(det)) && (Math.abs(det) < N);
}

const fill_output = (cv: any, H: any, valid: boolean) => {
  //vector<Point2f> warped(4);
  //var cv = await opencv;
  let output = new Float64Array(16);
  var warped =  new cv.Mat(4, 4, cv.CV_64FC2);
  console.log(corners);
  
  console.log(H);
  cv.perspectiveTransform(corners, warped, H);

  //output->valid = valid;
  console.log(H);

  output[0] = H.doubleAt(0,0);
  output[1] = H.doubleAt(0,1);
  output[2] = H.doubleAt(0,2);
  output[3] = H.doubleAt(1,0);
  output[4] = H.doubleAt(1,1);
  output[5] = H.doubleAt(1,2);
  output[6] = H.doubleAt(2,0);
  output[7] = H.doubleAt(2,1);
  output[8] = H.doubleAt(2,2);

  output[9]  = warped[0];
  output[10] = warped[1];
  output[11] = warped[2];
  output[12] = warped[3];
  output[13] = warped[4];
  output[14] = warped[5];
  output[15] = warped[6];
  output[16] = warped[7];

  console.log(output);

  corners.delete();
  warped.delete();

  return output;
}

const process = async (msg: any) => {
  // markerResult = null;
  markerResult = await track(msg);

  if (markerResult != null) {
    ctx.postMessage(markerResult);
  } else {
    ctx.postMessage({ type: "not found" });
  }
  next = <ImageData>(<unknown>null);
};

const track = async (msg: any) => {
  var result;
  var cv = await opencv;
  const keyFrameImageData = msg.imagedata;

  let src = new cv.Mat(msg.vHeight, msg.vWidth, cv.CV_8UC4);

  src.data.set(keyFrameImageData);

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
  } else {
    homography_transform = null;
  }

 var valid;
 
  if( homographyValid(homography) === false)  {
      var out = await fill_output(cv, homography, valid);
      console.log(out);   
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

  console.log("Homography from orb detector: ", homography_transform);

  result = { type: "found", matrix: JSON.stringify(homography_transform) };
  return result;
};
