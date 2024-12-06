import { WebARKitCoreCV } from "../core/WebARKitCoreCV2";
const ctx: Worker = self as any;

var next: any = null;

var _msg: any;
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
      process(msg);
    }
  }
};

const loadTrackables = (msg: any) => {
  const onLoad = (core: any) => {
    ocv = core;
    ocv.loadTrackables(msg);
    var EVENT = new CustomEvent("loaded", { detail: { CV: ocv } });
    ctx.dispatchEvent(EVENT);
  };

  const onError = function (error: any) {
    console.error(error);
  };

  WebARKitCoreCV.initCV().then(onLoad).catch(onError);
};

ctx.addEventListener("loaded", (e: any) => {
  ocv = e.detail.CV;
});

const process = (msg: any) => {
  markerResult = null;
    if (ocv && ocv.track) {

      markerResult = ocv.track(msg);
    }

    if (markerResult != null) {
      ctx.postMessage(markerResult);
    } else {
      ctx.postMessage({type: "not found"});
    }
    next = <ImageData>(<unknown>null);
};
