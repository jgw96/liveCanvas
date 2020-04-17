onmessage = (evt) => {

  if (evt.data.canvas) {
    var canvas = evt.data.canvas;
    console.log(canvas);
  }

  if (evt.data.data) {
    console.log(evt.data.data);
  }
  // var gl = canvas.getContext("2d");



  // ... some drawing using the gl context ...
};