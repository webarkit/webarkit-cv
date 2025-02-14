import cv from "../../build/opencv_js";

let initialized: boolean = false;

const _cv = {};

const waitResolves: any[] = [];

export const waitCV = async() => {
    if (initialized) return true;
    return new Promise((resolve, reject) => {
        waitResolves.push(resolve);
    });
}

cv().then((target: any) => {
    initialized = true;
    Object.assign(_cv, target);
    waitResolves.forEach((resolve) => {
        resolve();
    });
});

export const cv2 = _cv;