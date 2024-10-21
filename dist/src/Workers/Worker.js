import { WebARKitCoreCV } from "../core/WebARKitCoreCV";
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
      _msg = msg;
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
  //process(_msg);
  markerResult = ocv.track(_msg);
  ctx.postMessage(markerResult);
});
const process = (msg) => {
  // markerResult = null;
  console.log(ocv);
  if (ocv && ocv.track) {
    console.log(ocv);
    markerResult = ocv.track(msg);
  }
  console.log(markerResult);
  if (markerResult != null) {
    ctx.postMessage(markerResult);
  } else {
    ctx.postMessage({ type: "not found" });
  }
  next = null;
};
//# sourceMappingURL=Worker.js.map
