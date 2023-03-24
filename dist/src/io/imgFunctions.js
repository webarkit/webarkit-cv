export function imread(imageSource) {
    var img = null;
    if (typeof imageSource === 'string') {
        img = document.getElementById(imageSource);
    }
    else {
        img = imageSource;
    }
    var canvas = null;
    var ctx = null;
    var width, height;
    if (img instanceof HTMLImageElement) {
        canvas = document.createElement('canvas');
        width = img.width;
        height = img.height;
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
    }
    else if (img instanceof HTMLCanvasElement) {
        canvas = img;
        width = canvas.width;
        height = canvas.height;
        ctx = canvas.getContext('2d');
    }
    else {
        throw new Error('Please input the valid canvas or img id.');
        return;
    }
    //var imgData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
    //return imgData;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
;
//# sourceMappingURL=imgFunctions.js.map