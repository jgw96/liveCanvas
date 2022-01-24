import { get, set } from "idb-keyval";

let pickedColor: string | undefined;
let pickedMode: "pen" | "erase" = "pen";
let cursorContext: ImageBitmapRenderingContext | null;
let handle: any | undefined;
let offscreen: OffscreenCanvas | undefined;
let offscreenContext: OffscreenCanvasRenderingContext2D | null;
let thirdCanvas: HTMLCanvasElement | undefined;
let thirdContext: CanvasRenderingContext2D | null;
let waveform: any | undefined = undefined;
let presenter: any | undefined = undefined;
let mainContext: CanvasRenderingContext2D | null;
let worker: any;
let working: boolean = false;
let workingTimeout: any;

let liveEvents: any[] = [];

export const setHandle = async (handle: any) => {
  if (handle) {
    console.log("set handle", handle);
    handle = handle;
    await set("current_handle", handle);
  }
};

const handleResize = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement | OffscreenCanvas
) => {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  if (context) {
    context.lineCap = "round";
    context.lineJoin = "round";
    if (pickedColor) {
      context.strokeStyle = pickedColor;
    }
    context.lineWidth = 5;

    context.fillStyle = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "#181818"
      : "white";
  }

  if (worker) {
    worker.postMessage({
      resize: {
        width: window.innerWidth,
        height: window.innerHeight,
        fillStyle: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "#181818"
          : "white",
      },
    });
  }
};

export const doResize = async (canvas: HTMLCanvasElement) => {
  if (canvas && mainContext) {
    handleResize(mainContext, canvas);
  }
};

export const setupCanvas = async (
  canvas: HTMLCanvasElement
): Promise<CanvasRenderingContext2D | null> => {
  if (canvas) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const ctx = canvas.getContext("2d", {
      desynchronized: navigator.userAgent.toLowerCase().includes("android")
        ? false
        : true,
    });

    mainContext = ctx;

    if (ctx) {
      ctx.lineWidth = 5;
      ctx.lineCap = "round";

      // white if light theme, black if dark theme
      ctx.fillStyle = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "#181818"
        : "white";

      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if ((window as any).HapticsPredefinedWaveform) {
        const WAVEFORM_BUZZ_CONTINUOUS = 4107;

        waveform = new (window as any).HapticsPredefinedWaveform({
          waveformId: WAVEFORM_BUZZ_CONTINUOUS,
          intensity: 50,
        });
      }

      if ((navigator as any).ink) {
        presenter = await (navigator as any).ink.requestPresenter({
          presentationArea: canvas,
        });
      }
    }

    return ctx;
  } else {
    return null;
  }
};

export const changeColor = (color: string) => {
  pickedColor = color;
};

export const changeMode = (mode: "pen" | "erase") => {
  pickedMode = mode;
};

export const handleEvents = async (
  canvas: HTMLCanvasElement,
  cursorCanvas: HTMLCanvasElement | null,
  color: string,
  ctx: CanvasRenderingContext2D | null | undefined,
  socket: any
) => {
  const module = await import("pointer-tracker");

  if (cursorCanvas) {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  }

  if (window.OffscreenCanvas && cursorCanvas) {
    const testOffscreen = cursorCanvas.transferControlToOffscreen();

    worker = new Worker("offscreen.js");
    console.log("worker", worker);
    worker.postMessage({ canvas: testOffscreen }, [testOffscreen]);
  }

  const userData: any = await get("userData");

  if (canvas) {
    canvas.onpointermove = (ev: PointerEvent) => {
      if (ev.buttons === 32 && ev.button === -1 && ctx) {
        // eraser

        let tweakedPressure = ev.pressure * 6;

        ctx.lineWidth = 18 + tweakedPressure;

        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        ctx.moveTo(ev.clientX, ev.clientY);
        for (const point of ev.getCoalescedEvents()) {
          ctx.lineTo(point.clientX, point.clientY);
        }
        ctx.stroke();
      }
    };
  }

  new module.default(canvas, {
    start(pointer, event) {
      console.log(pointer);
      event.preventDefault();
      return true;
    },
    end(pointer) {
      console.log(pointer);
    },
    move(previousPointers, changedPointers, event: any) {
      if (pickedMode === "pen") {
        if (ctx) {
          ctx.globalCompositeOperation = "source-over";
        }

        if (event.haptics && waveform) {
          event.haptics.play(waveform);
        }

        let lineWidth;

        for (const pointer of changedPointers) {
          const previous = previousPointers.find((p) => p.id === pointer.id);

          if (ctx && previous) {
            ctx.strokeStyle = pickedColor || color;

            console.log(
              "should erase",
              (pointer.nativePointer as PointerEvent).buttons,
              (pointer.nativePointer as PointerEvent).button
            );

            if ((pointer.nativePointer as PointerEvent).pointerType === "pen") {
              let tweakedPressure =
                (pointer.nativePointer as PointerEvent).pressure * 6;
              ctx.lineWidth =
                (pointer.nativePointer as PointerEvent).width + tweakedPressure;

              lineWidth = ctx.lineWidth;
            } else if (
              (pointer.nativePointer as PointerEvent).pointerType === "touch"
            ) {
              ctx.lineWidth =
                (pointer.nativePointer as PointerEvent).width - 20;
              lineWidth = ctx.lineWidth;
            } else if (
              (pointer.nativePointer as PointerEvent).pointerType === "mouse"
            ) {
              ctx.lineWidth = 4;
              lineWidth = 4;
            }

            ctx.beginPath();

            ctx.moveTo(previous.clientX, previous.clientY);

            for (const point of pointer.getCoalesced()) {
              ctx.lineTo(point.clientX, point.clientY);
            }

            ctx.stroke();

            console.log("drawing", ctx);

            presenter.updateInkTrailStartPoint(event, {
              color: pickedColor || color,
              diameter: ctx.lineWidth,
            });

            // cursor
            /*offscreenContext?.beginPath();
            offscreenContext?.arc(
              event.clientX,
              event.clientY,
              10,
              0,
              2 * Math.PI
            );
            offscreenContext?.stroke();*/

            /*let bitmapOne = offscreen?.transferToImageBitmap();
            if (bitmapOne) {
              cursorContext?.transferFromImageBitmap(bitmapOne);
            }*/

            if (socket) {
              socket.emit("drawing", {
                x0: previous.clientX,
                y0: previous.clientY,
                x1: (event as PointerEvent).clientX,
                y1: (event as PointerEvent).clientY,
                color: pickedColor || color,
                buttons: event.buttons,
                button: event.button,
                pointerType: (event as PointerEvent).pointerType,
                pressure: (event as PointerEvent).pressure,
                width: lineWidth,
                globalCompositeOperation: "source-over",
                user: userData ? userData.name : null,
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
        if (ctx) {
          ctx.strokeStyle = ctx.fillStyle;

          ctx.lineWidth = 18;

          changedPointers.forEach((pointer) => {
            const previous = previousPointers.find((p) => p.id === pointer.id);

            if (ctx && previous) {
              ctx.beginPath();
              ctx.moveTo(previous.clientX, previous.clientY);
              for (const point of pointer.getCoalesced()) {
                ctx.lineTo(point.clientX, point.clientY);
              }
              ctx.stroke();
            }

            if (socket && previous) {
              socket.emit("drawing", {
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
                user: userData ? userData.name : null,
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
};

export const handleLiveEvents = (
  thirdCanvas: HTMLCanvasElement,
  thirdContext: CanvasRenderingContext2D,
  socket: any
) => {
  if (thirdCanvas && thirdContext) {
    thirdCanvas.width = window.innerWidth;
    thirdCanvas.height = window.innerHeight;

    thirdCanvas = thirdCanvas;

    thirdContext.lineCap = "round";

    thirdContext = thirdContext;
  }

  socket.on("drawing", (data: any) => {
    working = true;

    liveEvents.push(data);

    if (working === true) {
      clearTimeout(workingTimeout);
    }

    workingTimeout = setTimeout(() => {
      working = false;
      worker.postMessage({ liveEvents });

      liveEvents = [];
    }, 120);
  });
};
