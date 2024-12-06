import { WebARKitCoreCV } from "../core/WebARKitCoreCV2";
const ctx = self;
var next = null;
var _msg;
let ocv = null;
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
const loadTrackables = (msg) => {
    const onLoad = (core) => {
        ocv = core;
        ocv.loadTrackables(msg);
        var EVENT = new CustomEvent("loaded", { detail: { CV: ocv } });
        ctx.dispatchEvent(EVENT);
    };
    const onError = function (error) {
        console.error(error);
    };
    WebARKitCoreCV.initCV().then(onLoad).catch(onError);
};
ctx.addEventListener("loaded", (e) => {
    ocv = e.detail.CV;
});
const process = (msg) => {
    markerResult = null;
    if (ocv && ocv.track) {
        markerResult = ocv.track(msg);
    }
    if (markerResult != null) {
        ctx.postMessage(markerResult);
    }
    else {
        ctx.postMessage({ type: "not found" });
    }
    next = null;
};
//# sourceMappingURL=Worker.js.map