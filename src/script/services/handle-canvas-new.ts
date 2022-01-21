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
let presenter: any | undefined;

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

    // thirdCanvas.addEventListener("wheel", onMouseWheel, false);
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

      window.requestIdleCallback(() => {
        liveDrawings.push({
          x0: prevScaledX,
          y0: prevScaledY,
          x1: scaledX,
          y1: scaledY,
          color: data.color,
          lineWidth: thirdContext.lineWidth,
        });
      }, {
        timeout: 300
      })
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
  socket = socket;

  if (context) {
    context.lineCap = "round";
    context.lineJoin = 'round';
  }

  const module = await import("pointer-tracker");

  const userData: any = await get("userData");

  const WAVEFORM_BUZZ_CONTINUOUS = 4107;
  let waveform: any | undefined = undefined;

  if ((window as any).HapticsPredefinedWaveform) {
    waveform = new (window as any).HapticsPredefinedWaveform({ 
      waveformId: WAVEFORM_BUZZ_CONTINUOUS,
      intensity: 50
    });
  }

  if (canvas) {
    new module.default(canvas, {
      start(pointer, event) {
        event.preventDefault();

        // update the cursor coordinates
        cursorX = pointer.pageX;
        cursorY = pointer.pageY;
        return true;
      },
      end() {

      },
      move(previousPointers, changedPointers, event: any) {
        if (pickedMode === "pen") {
          if (context) {
            context.globalCompositeOperation = "source-over";
          }

          if (event.haptics && waveform) {
            event.haptics.play(waveform);
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

                  context.beginPath();
                  context.moveTo(prevScaledX, prevScaledY);
                  for (const point of pointer.getCoalesced()) {
                    // get mouse position
                    cursorX = point.nativePointer.clientX;
                    cursorY = point.nativePointer.clientY;
                    const scaledX = toTrueX(cursorX);
                    const scaledY = toTrueY(cursorY);

                    drawLine(
                      toScreenX(scaledX),
                      toScreenY(scaledY),
                      pickedColor || color,
                      context.lineWidth
                    );
                  }

                  context.stroke();
                  context.closePath();

                  presenter.updateInkTrailStartPoint(event, {
                    color: pickedColor || color,
                    diameter: context.lineWidth
                  });
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

              context.beginPath();

              context.moveTo(prevScaledX, prevScaledY);

              for (const point of pointer.getCoalesced()) {
                cursorX = point.nativePointer.clientX;
                cursorY = point.nativePointer.clientY;
                const scaledX = toTrueX(cursorX);
                const scaledY = toTrueY(cursorY);
                // context.lineTo(scaledX, scaledY);

                if (drawFlag) {
                  drawLine(
                    toScreenX(scaledX),
                    toScreenY(scaledY),
                    pickedColor || color,
                    context.lineWidth
                  );

                  window.requestIdleCallback(() => {
                    drawings.push({
                      x0: prevScaledX,
                      y0: prevScaledY,
                      x1: scaledX,
                      y1: scaledY,
                      color: pickedColor || color,
                      lineWidth: context.lineWidth,
                    });
                  }, {
                    timeout: 300
                  });
                }
              }

              context.stroke();
              context.closePath();

              presenter.updateInkTrailStartPoint(event, {
                color: pickedColor || color,
                // color: "#0000ff",
                diameter: context.lineWidth
              });

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

    if ((navigator as any).ink) {
      presenter = await (navigator as any).ink.requestPresenter({presentationArea: canvas});
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

export function clearDrawings() {
  drawings.length = 0;
}

function redrawCanvas() {
  console.log("redraw")
  if (canvas && context) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    context.lineCap = "round";
    context.lineJoin = "round";

    // white if light theme, black if dark theme
    context.fillStyle = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? "#181818"
    : "white";

    context.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// if the window changes size, redraw the canvas
window.addEventListener("resize", () => {
  redrawCanvas();
});

function drawLine(
  x1: number,
  y1: number,
  color: string,
  lineWidth: number
) {
  if (context) {
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
  }
}