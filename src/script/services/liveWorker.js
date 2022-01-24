onmessage = (evt) => {

  if (evt.data.canvas) {
    var canvas = evt.data.canvas;
    console.log(canvas);
  }

  if (evt.data.data) {
    console.log(evt.data.data);
  }
};