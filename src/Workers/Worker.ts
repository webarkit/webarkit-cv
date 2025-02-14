import { WebARKitCoreCV } from "../core/WebARKitCoreCV2";
const ctx: Worker = self as any;

var next: any = null;

var _msg: any;
var ocv: any = null;
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
      console.log("next...", next);
      process(msg);
    }
  }
};

const loadTrackables = (msg: any) => {
  const onLoad = (core: any) => {
    ocv = core;
    ocv.loadTrackables(msg);
    //const loadedEvent = new CustomEvent("loaded", { detail: { CV: ocv } });
    //ctx.dispatchEvent(loadedEvent);
  };

  const onError = function (error: any) {
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

const process = (msg: any) => {
  markerResult = null;
  if (ocv && ocv.track) {
    markerResult = ocv.track(msg);
    console.log("result...", markerResult);
  }

  if (markerResult != null) {
    ctx.postMessage(markerResult);
  } else {
    ctx.postMessage({ type: "not found", markerResult });
  }
  next = <ImageData>(<unknown>null);
};
