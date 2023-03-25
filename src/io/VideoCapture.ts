export function VideoCapture(videoSource: any) {
    var video: any = null;
    if (typeof videoSource === 'string') {
        video = document.getElementById(videoSource);
    } else {
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
    ctx!.drawImage(video, 0, 0, video.width, video.height);
    return ctx!.getImageData(0, 0, video.width, video.height)
};