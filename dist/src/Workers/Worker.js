import { WebARKitCoreCV } from "../core/WebARKitCoreCV";
const ctx = self;
let next = null;
let _msg;
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
            _msg = msg;
            //console.log("next...", next);
            process(msg);
        }
    }
};
const loadTrackables = (msg) => {
    const onLoad = (core) => {
        ocv = core;
        ocv.loadTrackables(msg);
        //const loadedEvent = new CustomEvent("loaded", { detail: { CV: ocv } });
        //ctx.dispatchEvent(loadedEvent);
    };
    const onError = function (error) {
        console.error(error);
    };
    WebARKitCoreCV.initCV().then(onLoad).catch(onError);
};
/*ctx.addEventListener("loaded", (e: any) => {
  ocv = e.detail.CV;
  if (ocv && ocv.track) {
    markerResult = ocv.track(_msg);
    if (!next) {
      ctx.postMessage({ type: "not found", markerResult });
      return;
    } else {
      //markerResult = ocv.track(_msg);
      ctx.postMessage(markerResult);
    }
  }
  //ctx.postMessage(markerResult);
});*/
const process = (msg) => {
    markerResult = null;
    if (ocv && ocv.track) {
        markerResult = ocv.track(msg);
        //console.log("result...", markerResult);
    }
    if (markerResult && typeof markerResult === "object" && markerResult.type) {
        ctx.postMessage(markerResult);
    }
    else {
        const payload = { type: "not found", markerResult: null };
        if (markerResult instanceof ImageData) {
            payload.finalImage = markerResult;
        }
        ctx.postMessage(payload);
    }
    next = null;
};
//# sourceMappingURL=Worker.js.map