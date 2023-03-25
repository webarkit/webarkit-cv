export function VideoCapture(videoSource) {
    var video = null;
    if (typeof videoSource === 'string') {
        video = document.getElementById(videoSource);
    }
    else {
        video = videoSource;
    }
    if (!(video instanceof HTMLVideoElement)) {
        throw new Error('Please input the valid video element or id.');
        return;
    }
    var canvas = document.createElement('canvas');
    canvas.width = video.width;
    canvas.height = video.height;
    var ctx = canvas.getContext('2d');
    //this.video: any = video;
    ctx.drawImage(video, 0, 0, video.width, video.height);
    return ctx.getImageData(0, 0, video.width, video.height);
    /*this.read = function(frame: any) {
        if (!(frame instanceof cv.Mat)) {
            throw new Error('Please input the valid cv.Mat instance.');
            return;
        }
        if (frame.type() !== cv.CV_8UC4) {
            throw new Error('Bad type of input mat: the type should be cv.CV_8UC4.');
            return;
        }
        if (frame.cols !== video.width || frame.rows !== video.height) {
            throw new Error('Bad size of input mat: the size should be same as the video.');
            return;
        }
        ctx!.drawImage(video, 0, 0, video.width, video.height);
        frame.data.set(ctx!.getImageData(0, 0, video.width, video.height).data);
    };*/
}
;
//# sourceMappingURL=VideoCapture.js.map