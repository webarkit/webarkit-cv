import cv from "../../build/opencv_js";
let initialized = false;
const _cv = {};
const waitResolves = [];
export const waitCV = async () => {
  if (initialized) return true;
  return new Promise((resolve, reject) => {
    waitResolves.push(resolve);
  });
};
cv().then((target) => {
  initialized = true;
  Object.assign(_cv, target);
  waitResolves.forEach((resolve) => {
    resolve();
  });
});
export const cv2 = _cv;
//# sourceMappingURL=opencv-helper.js.map
