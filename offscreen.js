let canvas;
let offscreenContext;

onmessage = function (evt) {
  if (evt.data.liveEvents) {
    offscreenContext.beginPath();
    offscreenContext.moveTo(evt.data.liveEvents[0].x0, evt.data.liveEvents[0].y0);
    evt.data.liveEvents.map((event) => {
      if (offscreenContext) {
        offscreenContext.strokeStyle = event.color;
        offscreenContext.lineWidth = event.width;
        offscreenContext.globalCompositeOperation = event.globalCompositeOperation;

        offscreenContext.lineTo(event.x1, event.y1);
      }
    });
    offscreenContext.stroke();
    offscreenContext.closePath();
  } 
  else if (evt.data.resize) {
    offscreenContext.canvas.width = evt.data.resize.width;
    offscreenContext.canvas.height = evt.data.resize.height;

    offscreenContext.lineJoin = "round";
    offscreenContext.lineCap = "round";
  }
  else {
    canvas = evt.data.canvas;
    offscreenContext = canvas.getContext("2d");

    offscreenContext.lineJoin = "round";
    offscreenContext.lineCap = "round";
  }
};
