import { WebARKitCoreCV } from "../core/WebARKitCoreCV";
const ctx: Worker = self as any;

var next: any = null;

var _msg;
let ocv: any = null;
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
      _msg = msg;
      process(msg);
    }
    case "loaded": {
      ocv = msg.CV;

    }
  }
};

const loadTrackables = (msg: any) => {

  const onLoad = (core: any) => {
    ocv = core;
    console.log(core);
    console.log(ocv)
    var EVENT = new CustomEvent("loaded", { detail: { CV: ocv } });
    ctx.dispatchEvent(EVENT);
    ocv.loadTrackables(msg);
  }

  const onError = function (error: any) {
    console.error(error);
  };

  WebARKitCoreCV.initCV().then(onLoad).catch(onError);
  console.log(ocv);
};

ctx.addEventListener("loaded", (e: any) => {
  console.log(e)
  ocv = e.detail.CV;
});

const process = (msg: any) => {
  // markerResult = null;
  console.log(ocv);

  if (ocv && ocv.track) {
    console.log(ocv);

    markerResult = ocv.track(msg);
  }

  if (markerResult != null) {
    ctx.postMessage(markerResult);
  } else {
    ctx.postMessage({ type: "not found" });
  }
  next = <ImageData>(<unknown>null);
};