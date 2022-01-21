import { get, set } from "idb-keyval";

let context: CanvasRenderingContext2D | null = null;
let canvas: HTMLCanvasElement | undefined = undefined;

let pickedColor: string | undefined;
let pickedMode: "pen" | "erase" = "pen";
let cursorContext: ImageBitmapRenderingContext | null;
let handle: any | undefined;
let offscreen: OffscreenCanvas | undefined;
let offscreenContext: OffscreenCanvasRenderingContext2D | null;
let currentSocket: any;
let thirdCanvasSetup: HTMLCanvasElement | undefined;
let thirdContextSetup: CanvasRenderingContext2D | null;
let drawFlag: boolean = true;

export function handleLiveEventsOffscreen(
  thirdCanvas: HTMLCanvasElement,
  thirdContext: CanvasRenderingContext2D,
  socket: any,
  cursorCanvas: HTMLCanvasElement,
) {
  console.log(window.OffscreenCanvas)
  if (window.OffscreenCanvas) {
    const offscreenCanvas = new OffscreenCanvas(
      window.innerWidth,
      window.innerHeight
    );
    console.log(offscreenCanvas);
    offscreenContext = offscreenCanvas.getContext("2d");

    offscreen = offscreenCanvas;

    if (offscreenContext) {
      offscreenContext.lineCap = "round";
    }

    if (cursorCanvas) {
      cursorCanvas.width = window.innerWidth;
      cursorCanvas.height = window.innerHeight;
  
      cursorContext = cursorCanvas.getContext("bitmaprenderer");
    }

    console.log('listening', socket);

    socket.on("drawing", (data: any) => {
      console.log('here');
      if (offscreenContext) {
        offscreenContext.strokeStyle = data.color;
  
        offscreenContext.globalCompositeOperation = data.globalCompositeOperation;
  
        if (data.pointerType === "pen") {
          let tweakedPressure = data.pressure * 6;
          offscreenContext.lineWidth = data.width + tweakedPressure;
  
          if (data.buttons === 32 && data.button === -1) {
            // eraser
            offscreenContext.globalCompositeOperation = "destination-out";
  
            offscreenContext.lineWidth = 18;
          }
        } else if (data.pointerType === "touch") {
          offscreenContext.lineWidth = data.width - 20;
        } else if (data.pointerType === "mouse") {
          offscreenContext.lineWidth = 4;
        }
  
        if (data.globalCompositeOperation === "destination-out") {
          offscreenContext.lineWidth = 18;
        }
  
        offscreenContext?.beginPath();
        offscreenContext?.arc(data.x0, data.y0, 10, 0, 2 * Math.PI);
        offscreenContext?.stroke();
  
        console.log('user', data.user);
  
        if (data.user) {
          console.log('user', data.user);
          offscreenContext?.fillText(data.user.name, data.x0 + 14, data.y0);
        }
  
        console.log('offscreen', offscreen);
  
        offscreenContext.beginPath();
  
        offscreenContext.moveTo(data.x0, data.y0);
  
        offscreenContext.lineTo(data.x1, data.y1);
  
        offscreenContext.stroke();
  
        const prevScaledX = toTrueX(data.x0);
        const prevScaledY = toTrueY(data.y0);
  
        const scaledY = toTrueY(data.y1);
        const scaledX = toTrueX(data.x1);
  
        liveDrawings.push({
          x0: prevScaledX,
          y0: prevScaledY,
          x1: scaledX,
          y1: scaledY,
          color: data.color,
          lineWidth: thirdContext.lineWidth,
        });

        let bitmapOne = offscreen?.transferToImageBitmap();
  
        if (bitmapOne) {
          console.log('transfer image', bitmapOne);
          cursorContext?.transferFromImageBitmap(bitmapOne);
        }
      }
    })
  }
}

export const handleLiveEvents = (
  thirdCanvas: HTMLCanvasElement,
  thirdContext: CanvasRenderingContext2D,
  socket: any,
  cursorCanvas: HTMLCanvasElement,
) => {
  console.log('cursorCanvas', cursorCanvas);
  if (thirdCanvas && thirdContext) {
    console.log("thirdCanvas liveEvents", thirdCanvas);
    thirdCanvas.width = window.innerWidth;
    thirdCanvas.height = window.innerHeight;

    thirdCanvasSetup = thirdCanvas;
    thirdContextSetup = thirdContext;

    thirdContext.lineCap = "round";

    console.log("thirdCanvas liveEvents", thirdCanvas);

    thirdCanvas.addEventListener("wheel", onMouseWheel, false);
  }

  if (cursorCanvas) {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;

    cursorContext = cursorCanvas.getContext("bitmaprenderer");
  }

  currentSocket = socket;

  if (window.OffscreenCanvas) {
    const offscreenCanvas = new OffscreenCanvas(
      window.innerWidth,
      window.innerHeight
    );
    offscreenContext = offscreenCanvas.getContext("2d");

    offscreen = offscreenCanvas;

    if (offscreenContext) {
      offscreenContext.font = "20px sans-serif";
      offscreenContext.strokeStyle = "white";
      offscreenContext.fillStyle = "white";
    }
  }

  socket.on("drawing", (data: any) => {
    console.log(data);
    if (thirdContext) {
      thirdContext.strokeStyle = data.color;

      thirdContext.globalCompositeOperation = data.globalCompositeOperation;

      if (data.pointerType === "pen") {
        let tweakedPressure = data.pressure * 6;
        thirdContext.lineWidth = data.width + tweakedPressure;

        if (data.buttons === 32 && data.button === -1) {
          // eraser
          thirdContext.globalCompositeOperation = "destination-out";

          thirdContext.lineWidth = 18;
        }
      } else if (data.pointerType === "touch") {
        thirdContext.lineWidth = data.width - 20;
      } else if (data.pointerType === "mouse") {
        thirdContext.lineWidth = 4;
      }

      if (data.globalCompositeOperation === "destination-out") {
        thirdContext.lineWidth = 18;
      }

      offscreenContext?.beginPath();
      offscreenContext?.arc(data.x0, data.y0, 10, 0, 2 * Math.PI);
      offscreenContext?.stroke();

      console.log('user', data.user);

      if (data.user) {
        console.log('user', data.user);
        offscreenContext?.fillText(data.user.name, data.x0 + 14, data.y0);
      }

      console.log('offscreen', offscreen);

      let bitmapOne = offscreen?.transferToImageBitmap();

      if (bitmapOne) {
        console.log('transfer image', bitmapOne);
        cursorContext?.transferFromImageBitmap(bitmapOne);
      }

      thirdContext.beginPath();

      thirdContext.moveTo(data.x0, data.y0);

      thirdContext.lineTo(data.x1, data.y1);

      thirdContext.stroke();

      const prevScaledX = toTrueX(data.x0);
      const prevScaledY = toTrueY(data.y0);

      const scaledY = toTrueY(data.y1);
      const scaledX = toTrueX(data.x1);

      liveDrawings.push({
        x0: prevScaledX,
        y0: prevScaledY,
        x1: scaledX,
        y1: scaledY,
        color: data.color,
        lineWidth: thirdContext.lineWidth,
      });
    }
  });
};

export const setHandle = async (handle: any) => {
  if (handle) {
    console.log("set handle", handle);
    handle = handle;
    await set("current_handle", handle);
  }
};

export const changeColor = (color: string) => {
  pickedColor = color;
};

export const changeMode = (mode: "pen" | "erase") => {
  pickedMode = mode;
};

export const handleEvents = async (
  color: string,
  context: CanvasRenderingContext2D | null | undefined,
  socket: any
) => {
  console.log("context", context);

  socket = socket;

  if (context) {
    context.lineCap = "round";
  }

  const module = await import("pointer-tracker");
  console.log("here", canvas);

  const userData: any = await get("userData");

  if (canvas) {
    new module.default(canvas, {
      start(pointer, event) {
        console.log(pointer);
        event.preventDefault();

        // update the cursor coordinates
        cursorX = pointer.pageX;
        cursorY = pointer.pageY;
        return true;
      },
      end(pointer) {
        console.log(pointer);
      },
      move(previousPointers, changedPointers, event: any) {
        console.log("moveEvent", event, pickedMode);

        if (pickedMode === "pen") {
          if (context) {
            context.globalCompositeOperation = "source-over";
          }

          for (const pointer of changedPointers) {
            cursorX = pointer.pageX;
            cursorY = pointer.pageY;
            const previous = previousPointers.find((p) => p.id === pointer.id);

            if (context && previous) {
              context.strokeStyle = pickedColor || color;

              const prevScaledX = toTrueX(previous.nativePointer.clientX);
              const prevScaledY = toTrueY(previous.nativePointer.clientY);

              if (
                (pointer.nativePointer as PointerEvent).pointerType === "pen"
              ) {
                let tweakedPressure =
                  (pointer.nativePointer as PointerEvent).pressure * 6;
                context.lineWidth =
                  (pointer.nativePointer as PointerEvent).width +
                  tweakedPressure;

                if (
                  (pointer.nativePointer as PointerEvent).buttons === 32 &&
                  (pointer.nativePointer as PointerEvent).button === -1
                ) {
                  // eraser
                  context.lineWidth = 18;

                  context.strokeStyle = context.fillStyle;
                  // context.beginPath();
                  // context.moveTo(prevScaledX, prevScaledY);
                  for (const point of pointer.getCoalesced()) {
                    // get mouse position
                    cursorX = point.nativePointer.clientX;
                    cursorY = point.nativePointer.clientY;
                    const scaledX = toTrueX(cursorX);
                    const scaledY = toTrueY(cursorY);

                    drawLine(
                      toScreenX(prevScaledX),
                      toScreenY(prevScaledY),
                      toScreenX(scaledX),
                      toScreenY(scaledY),
                      pickedColor || color,
                      context.lineWidth
                    );
                  }
                  // context.stroke();
                }
              } else if (
                (pointer.nativePointer as PointerEvent).pointerType === "touch"
              ) {
                context.lineWidth =
                  (pointer.nativePointer as PointerEvent).width - 20;
              } else if (
                (pointer.nativePointer as PointerEvent).pointerType === "mouse"
              ) {
                context.lineWidth = 4;
              }

              /*context.beginPath();

              context.moveTo(prevScaledX, prevScaledY);*/

              for (const point of pointer.getCoalesced()) {
                cursorX = point.nativePointer.clientX;
                cursorY = point.nativePointer.clientY;
                const scaledX = toTrueX(cursorX);
                const scaledY = toTrueY(cursorY);
                // context.lineTo(scaledX, scaledY);

                console.log('drawFlag', drawFlag);
                if (drawFlag) {
                  drawLine(
                    toScreenX(prevScaledX),
                    toScreenY(prevScaledY),
                    toScreenX(scaledX),
                    toScreenY(scaledY),
                    pickedColor || color,
                    context.lineWidth
                  );
  
                  drawings.push({
                    x0: prevScaledX,
                    y0: prevScaledY,
                    x1: scaledX,
                    y1: scaledY,
                    color: pickedColor || color,
                    lineWidth: context.lineWidth,
                  });
                }
              }

              // context.stroke();*/

              // cursor
              offscreenContext?.beginPath();
              offscreenContext?.arc(
                event.clientX,
                event.clientY,
                10,
                0,
                2 * Math.PI
              );
              offscreenContext?.stroke();

              let bitmapOne = offscreen?.transferToImageBitmap();
              if (bitmapOne) {
                cursorContext?.transferFromImageBitmap(bitmapOne);
              }

              if (currentSocket) {
                currentSocket.emit("drawing", {
                  x0: previous.clientX,
                  y0: previous.clientY,
                  x1: (event as PointerEvent).clientX,
                  y1: (event as PointerEvent).clientY,
                  color: pickedColor || color,
                  buttons: event.buttons,
                  button: event.button,
                  pointerType: (event as PointerEvent).pointerType,
                  pressure: (event as PointerEvent).pressure,
                  width: (event as PointerEvent).width,
                  globalCompositeOperation: "source-over",
                  user: userData ? userData : null,
                });
              }

              (window as any).requestIdleCallback(
                async () => {
                  if (canvas) {
                    let canvasState = canvas.toDataURL();
                    await set("canvasState", canvasState);
                  }
                },
                {
                  timeout: 200,
                }
              );
            }
          }
        } else if (pickedMode === "erase") {
          console.log("erasing");
          if (context) {
            context.strokeStyle = context.fillStyle;

            context.lineWidth = 18;

            changedPointers.forEach((pointer) => {
              const previous = previousPointers.find(
                (p) => p.id === pointer.id
              );

              if (context && previous) {
                context.beginPath();
                context.moveTo(previous.clientX, previous.clientY);
                for (const point of pointer.getCoalesced()) {
                  context.lineTo(point.clientX, point.clientY);
                }
                context.stroke();
              }

              if (currentSocket && previous) {
                currentSocket.emit("drawing", {
                  x0: previous.clientX,
                  y0: previous.clientY,
                  x1: (event as PointerEvent).clientX,
                  y1: (event as PointerEvent).clientY,
                  color: pickedColor || color,
                  buttons: event.buttons,
                  button: event.button,
                  pointerType: (event as PointerEvent).pointerType,
                  pressure: (event as PointerEvent).pressure,
                  width: (event as PointerEvent).width,
                  globalCompositeOperation: "destination-out",
                  user: null,
                });
              }

              (window as any).requestIdleCallback(
                async () => {
                  const fileModule = await import("browser-fs-access");

                  if (canvas) {
                    let canvasState = canvas.toDataURL();
                    await set("canvasState", canvasState);

                    if (handle) {
                      canvas.toBlob(async (blob) => {
                        if (blob) {
                          await fileModule.fileSave(blob, {}, handle);
                        }
                      });
                    }
                  }
                },
                {
                  timeout: 200,
                }
              );
            });
          }
        }
      },
    });
  }
};

export const setupCanvas = async (
  canvasEL: HTMLCanvasElement
): Promise<CanvasRenderingContext2D | null> => {
  return new Promise<CanvasRenderingContext2D | null>(async (resolve) => {
    canvas = canvasEL;
    console.log(canvas);
    // Mouse Event Handlers
    /*canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);
    canvas.addEventListener("wheel", onMouseWheel, false);

    // Touch Event Handlers
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    canvas.addEventListener("touchmove", onTouchMove);*/

    canvas.addEventListener("wheel", onMouseWheel, false);

    /*canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    canvas.addEventListener("touchmove", onTouchMove);*/

    context = canvas.getContext("2d", {
      desynchronized: navigator.userAgent.toLowerCase().includes("android")
        ? false
        : true,
    });

    if (context) {
      context.lineWidth = 5;
      context.lineCap = "round";

      // white if light theme, black if dark theme
      context.fillStyle = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "#181818"
        : "white";

      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    resolve(context);
  });
};

// list of all strokes drawn
const drawings: any[] = [];
const liveDrawings: any[] = [];

// coordinates of our cursor
let cursorX;
let cursorY;

// distance from origin
let offsetX = 0;
let offsetY = 0;

// zoom amount
let scale = 1;

// convert coordinates
function toScreenX(xTrue: number) {
  return (xTrue + offsetX) * scale;
}
function toScreenY(yTrue: number) {
  return (yTrue + offsetY) * scale;
}
function toTrueX(xScreen: number) {
  return xScreen / scale - offsetX;
}
function toTrueY(yScreen: number) {
  return yScreen / scale - offsetY;
}
function trueHeight() {
  if (canvas) {
    return canvas.clientHeight / scale;
  }
}
function trueWidth() {
  if (canvas) {
    return canvas.clientWidth / scale;
  }
}

export function clearDrawings() {
  drawings.length = 0;
}

function redrawCanvas() {
  console.log("redraw")

  if (canvas && context) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    context.lineCap = "round";

    // white if light theme, black if dark theme
    context.fillStyle = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? "#181818"
    : "white";

    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drawings.length; i++) {
      const line = drawings[i];
      console.log(line);
      drawLine(
        toScreenX(line.x0),
        toScreenY(line.y0),
        toScreenX(line.x1),
        toScreenY(line.y1),
        line.color,
        line.lineWidth
      );
    }

    if (thirdCanvasSetup && thirdContextSetup) {
      thirdCanvasSetup.height = window.innerHeight;
      thirdCanvasSetup.width = window.innerWidth;

      thirdContextSetup.lineCap = "round";
    }

    for (let i = 0; i < liveDrawings.length; i++) {
      const line = liveDrawings[i];
      drawLine(
        toScreenX(line.x0),
        toScreenY(line.y0),
        toScreenX(line.x1),
        toScreenY(line.y1),
        line.color,
        line.lineWidth
      );
    }
  }
}
redrawCanvas();

// if the window changes size, redraw the canvas
window.addEventListener("resize", () => {
  redrawCanvas();
});

// mouse functions
//let leftMouseDown = false;
//let rightMouseDown = false;
/*function onMouseDown(event: { button: number; pageX: any; pageY: any }) {
  // detect left clicks
  if (event.button == 0) {
    leftMouseDown = true;
    rightMouseDown = false;
  }
  // detect right clicks
  if (event.button == 2) {
    rightMouseDown = true;
    leftMouseDown = false;
  }

  // update the cursor coordinates
  cursorX = event.pageX;
  cursorY = event.pageY;
  prevCursorX = event.pageX;
  prevCursorY = event.pageY;
}*/
/*function onMouseMove(event: { pageX: any; pageY: any }) {
  // get mouse position
  cursorX = event.pageX;
  cursorY = event.pageY;
  const scaledX = toTrueX(cursorX);
  const scaledY = toTrueY(cursorY);
  const prevScaledX = toTrueX(prevCursorX);
  const prevScaledY = toTrueY(prevCursorY);

  if (leftMouseDown) {
    // add the line to our drawing history
    /*drawings.push({
      x0: prevScaledX,
      y0: prevScaledY,
      x1: scaledX,
      y1: scaledY,
    });*/
    // draw a line
    // drawLine(prevCursorX, prevCursorY, cursorX, cursorY);
  /*}
  if (rightMouseDown) {
    // move the screen
    offsetX += (cursorX - prevCursorX) / scale;
    offsetY += (cursorY - prevCursorY) / scale;
    redrawCanvas();
  }
  prevCursorX = cursorX;
  prevCursorY = cursorY;
}

/*function onMouseUp() {
  leftMouseDown = false;
  rightMouseDown = false;
}*/

function onMouseWheel(event: { deltaY: any; pageX: number; pageY: number }) {
  console.log("mouseWheel");
  const deltaY = event.deltaY;
  const scaleAmount = -deltaY / 500;
  scale = scale * (1 + scaleAmount);

  // zoom the page based on where the cursor is
  if (canvas) {
    var distX = event.pageX / canvas.clientWidth;
    var distY = event.pageY / canvas.clientHeight;

    // calculate how much we need to zoom
    let zoomWidthCalc = trueWidth();
    let zoomHeightCalc = trueHeight();

    const unitsZoomedX = zoomWidthCalc ? zoomWidthCalc * scaleAmount : 0;
    const unitsZoomedY = zoomHeightCalc ? zoomHeightCalc * scaleAmount : 0;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offsetX -= unitsAddLeft;
    offsetY -= unitsAddTop;

    redrawCanvas();
  }
}
function drawLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  lineWidth: number
) {
  if (context) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
    context.closePath();
  }
}

// touch functions
/*const prevTouches: any = [null, null]; // up to 2 touches
let singleTouch = false;
let doubleTouch = false;
function onTouchStart(event: TouchEvent) {
  if (event.touches.length == 1) {
    singleTouch = true;
    doubleTouch = false;

    drawFlag = true;
    console.log("drawFlag", drawFlag);
  }
  if (event.touches.length >= 2) {
    singleTouch = false;
    doubleTouch = true;

    drawFlag = false;
    console.log("drawFlag", drawFlag);
  }

  // store the last touches
  prevTouches[0] = event.touches[0];
  prevTouches[1] = event.touches[1];
}

function onTouchMove(event: TouchEvent) {
  console.log("touchEvent", event);
  // get first touch coordinates
  const touch0X = event.touches[0].pageX;
  const touch0Y = event.touches[0].pageY;
  const prevTouch0X = prevTouches[0]?.pageX;
  const prevTouch0Y = prevTouches[0]?.pageY;

  if (doubleTouch) {
    // get second touch coordinates
    const touch1X = event.touches[1].pageX;
    const touch1Y = event.touches[1].pageY;
    const prevTouch1X = prevTouches[1].pageX;
    const prevTouch1Y = prevTouches[1].pageY;

    // get midpoints
    const midX = (touch0X + touch1X) / 2;
    const midY = (touch0Y + touch1Y) / 2;
    const prevMidX = (prevTouch0X + prevTouch1X) / 2;
    const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

    // calculate the distances between the touches
    const hypot = Math.sqrt(
      Math.pow(touch0X - touch1X, 2) + Math.pow(touch0Y - touch1Y, 2)
    );
    const prevHypot = Math.sqrt(
      Math.pow(prevTouch0X - prevTouch1X, 2) +
        Math.pow(prevTouch0Y - prevTouch1Y, 2)
    );

    // calculate the screen scale change
    var zoomAmount = hypot / prevHypot;
    scale = scale * zoomAmount;
    const scaleAmount = 1 - zoomAmount;

    // calculate how many pixels the midpoints have moved in the x and y direction
    const panX = midX - prevMidX;
    const panY = midY - prevMidY;
    // scale this movement based on the zoom level
    offsetX += panX / scale;
    offsetY += panY / scale;

    // Get the relative position of the middle of the zoom.
    // 0, 0 would be top left.
    // 0, 1 would be top right etc.
    let zoomRatioX;
    let zoomRatioY;

    if (canvas) {
      zoomRatioX = midX / canvas?.clientWidth;
      zoomRatioY = midY / canvas?.clientHeight;
    }

    // calculate the amounts zoomed from each edge of the screen
    let trueWidthCalc = trueWidth();
    let trueHeightCalc = trueHeight();
    let unitsZoomedX = trueWidthCalc ? trueWidthCalc * scaleAmount : 0;
    const unitsZoomedY = trueHeightCalc ? trueHeightCalc * scaleAmount : 0;

    const unitsAddLeft = zoomRatioX ? unitsZoomedX * zoomRatioX : 0;
    const unitsAddTop = zoomRatioY ? unitsZoomedY * zoomRatioY : 0;

    offsetX += unitsAddLeft;
    offsetY += unitsAddTop;

    redrawCanvas();
  }

  prevTouches[0] = event.touches[0];
  prevTouches[1] = event.touches[1];
}
function onTouchEnd(event: any) {
  singleTouch = false;
  doubleTouch = false;

  drawFlag = true;
}
*/