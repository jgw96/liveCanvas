import { fileSave, FileSystemHandle } from "browser-fs-access";
import { get, set } from "idb-keyval";

let pickedColor: string | undefined;
let pickedMode: 'pen' | 'erase' = "pen";
let cursorContext: ImageBitmapRenderingContext | null;
let handle: FileSystemHandle | undefined;
let offscreen: OffscreenCanvas | undefined;
let offscreenContext: OffscreenCanvasRenderingContext2D | null;
let thirdCanvas: HTMLCanvasElement | undefined;
let thirdContext: CanvasRenderingContext2D | null;

export const setHandle = async (handle: FileSystemHandle) => {
  if (handle) {
    console.log('set handle', handle);
    handle = handle;
    await set('current_handle', handle);
  }
}

export const setupCanvas = (canvas: HTMLCanvasElement) => {
  if (canvas) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const ctx = canvas.getContext("2d", {
      desynchronized: true,
    });

    if (ctx) {
      ctx.lineWidth = 5;
      ctx.lineCap = "round";

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
}

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

    cursorContext = cursorCanvas.getContext("bitmaprenderer");
  }

  if (window.OffscreenCanvas) {
    offscreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    offscreenContext = offscreen.getContext("2d");

    if (offscreenContext) {
      offscreenContext.lineWidth = 4;
    }
  }

  const userData: any = await get("userData");

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
      console.log(event);

      if (pickedMode === "pen") {
        if (ctx) {
          ctx.globalCompositeOperation = "source-over";
        }

        for (const pointer of changedPointers) {
          const previous = previousPointers.find((p) => p.id === pointer.id);

          if (ctx && previous) {
            ctx.strokeStyle = pickedColor || color;

            if ((pointer.nativePointer as PointerEvent).pointerType === "pen") {
              let tweakedPressure =
                (pointer.nativePointer as PointerEvent).pressure * 6;
              ctx.lineWidth =
                (pointer.nativePointer as PointerEvent).width + tweakedPressure;

              if (
                (pointer.nativePointer as PointerEvent).buttons === 32 &&
                (pointer.nativePointer as PointerEvent).button === -1
              ) {
                // eraser
                ctx.lineWidth = 18;

                ctx.globalCompositeOperation = "destination-out";
                ctx.beginPath();
                ctx.moveTo(previous.clientX, previous.clientY);
                for (const point of pointer.getCoalesced()) {
                  ctx.lineTo(point.clientX, point.clientY);
                }
                ctx.stroke();
              }
            } else if (
              (pointer.nativePointer as PointerEvent).pointerType === "touch"
            ) {
              ctx.lineWidth =
                (pointer.nativePointer as PointerEvent).width - 20;
            } else if (
              (pointer.nativePointer as PointerEvent).pointerType === "mouse"
            ) {
              ctx.lineWidth = 4;
            }

            ctx.beginPath();

            ctx.moveTo(previous.clientX, previous.clientY);

            for (const point of pointer.getCoalesced()) {
              ctx.lineTo(point.clientX, point.clientY);
            }

            ctx.stroke();

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

            if (socket) {
              console.log("pointer event", event);
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
                globalCompositeOperation: "source-over",
                user: userData ? userData.name : null,
              });
            }

            (window as any).requestIdleCallback(async () => {
              if (canvas) {
                let canvasState = canvas.toDataURL();
                await set("canvasState", canvasState);
              }
            }, {
              timeout: 200
            });
          }
        }
      } else if (pickedMode === "erase") {
        console.log('erasing');
        if (ctx) {
          ctx.globalCompositeOperation = "destination-out";

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

            (window as any).requestIdleCallback(async () => {
              if (canvas) {
                let canvasState = canvas.toDataURL();
                await set("canvasState", canvasState);

                if (handle) {
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      await fileSave(blob, {}, handle);
                    }
                  })
                }
              }
            }, {
              timeout: 200
            });
          });
        }
      }
    },
  });
};

export const resetCursorCanvas = (width: number, height: number) => {
  if (offscreen) {
    offscreen.width = width;
    offscreen.height = height;
  }

  if (thirdCanvas) {
    thirdCanvas.width = width;
    thirdCanvas.height = height;
  }

  if (thirdContext) {
    thirdContext.lineCap = "round";
  }
}

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

  if (window.OffscreenCanvas) {
    const offscreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    const offscreenContext = offscreen.getContext("2d");

    if (offscreenContext) {
      offscreenContext.font = "20px sans-serif";
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

      if (data.user) {
        offscreenContext?.fillText(data.user, data.x0 + 14, data.y0);
      }

      let bitmapOne = offscreen?.transferToImageBitmap();

      if (bitmapOne) {
        cursorContext?.transferFromImageBitmap(bitmapOne);
      }

      thirdContext.beginPath();

      thirdContext.moveTo(data.x0, data.y0);

      thirdContext.lineTo(data.x1, data.y1);

      thirdContext.stroke();
    }
  });
};
