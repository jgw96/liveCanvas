import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from "lit-element";

import { get } from "idb-keyval";

@customElement("local-canvas")
export class LocalCanvas extends LitElement {
  @property({ type: Object }) userData: any = null;
  @property() mode: string | undefined;
  @property() color: string | undefined;
  @property() socket: any;

  @internalProperty() ctx: CanvasRenderingContext2D | null | undefined;

  static get styles() {
    return css`
      canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        touch-action: none;
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    this.setupCanvas();
    await this.setupEvents();
  }

  setupCanvas() {
    const canvas = this.shadowRoot?.querySelector("canvas");
    this.ctx = canvas?.getContext("2d", {
      desynchronized: true,
    });

    if (canvas) {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    }

    if (this.ctx) {
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = "round";
    }
  }

  async setupEvents() {
      console.log('here');
    const module = await import("pointer-tracker");

    const canvas = this.shadowRoot?.querySelector(
      "canvas"
    ) as HTMLCanvasElement;

    console.log(canvas);

    const cursorCanvas:
      | HTMLCanvasElement
      | null
      | undefined = this.shadowRoot?.querySelector("#secondCanvas");
    const cursorContext = cursorCanvas?.getContext("bitmaprenderer");

    if (cursorCanvas) {
      cursorCanvas.width = window.innerWidth;
      cursorCanvas.height = window.innerHeight;
    }

    const offscreen = new OffscreenCanvas(
      window.innerWidth,
      window.innerHeight
    );
    const offscreenContext = offscreen.getContext("2d");

    if (offscreenContext) {
      offscreenContext.lineWidth = 4;
    }

    let that = this;

    const userData: any = await get("userData");

    console.log('here2')

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
          console.log("Moving");
        console.log(event);

        if (that.mode === "pen") {
          if (that.ctx) {
            that.ctx.globalCompositeOperation = "source-over";
          }

          for (const pointer of changedPointers) {
            const previous = previousPointers.find((p) => p.id === pointer.id);

            if (that.ctx && that.color && previous) {
              that.ctx.strokeStyle = that.color;

              if (
                (pointer.nativePointer as PointerEvent).pointerType === "pen"
              ) {
                let tweakedPressure =
                  (pointer.nativePointer as PointerEvent).pressure * 6;
                that.ctx.lineWidth =
                  (pointer.nativePointer as PointerEvent).width +
                  tweakedPressure;
              } else if (
                (pointer.nativePointer as PointerEvent).pointerType === "touch"
              ) {
                that.ctx.lineWidth =
                  (pointer.nativePointer as PointerEvent).width - 20;
              } else if (
                (pointer.nativePointer as PointerEvent).pointerType === "mouse"
              ) {
                that.ctx.lineWidth = 4;
              }

              that.ctx.beginPath();

              that.ctx.moveTo(previous.clientX, previous.clientY);

              for (const point of pointer.getCoalesced()) {
                that.ctx.lineTo(point.clientX, point.clientY);
              }

              that.ctx.stroke();

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

              let bitmapOne = offscreen.transferToImageBitmap();
              cursorContext?.transferFromImageBitmap(bitmapOne);

              if (that.socket) {
                that.socket.emit("drawing", {
                  x0: previous.clientX,
                  y0: previous.clientY,
                  x1: (event as PointerEvent).clientX,
                  y1: (event as PointerEvent).clientY,
                  color: that.color,
                  pointerType: (event as PointerEvent).pointerType,
                  pressure: (event as PointerEvent).pressure,
                  width: (event as PointerEvent).width,
                  globalCompositeOperation: "source-over",
                  user: userData ? userData.name : null,
                });
              }
            }
          }
        } else if (that.mode === "erase") {
          if (that.ctx) {
            that.ctx.globalCompositeOperation = "destination-out";

            that.ctx.lineWidth = 18;

            changedPointers.forEach((pointer) => {
              const previous = previousPointers.find(
                (p) => p.id === pointer.id
              );

              if (that.ctx && previous) {
                that.ctx.beginPath();
                that.ctx.moveTo(previous.clientX, previous.clientY);
                for (const point of pointer.getCoalesced()) {
                  that.ctx.lineTo(point.clientX, point.clientY);
                }
                that.ctx.stroke();
              }

              if (that.socket && previous) {
                that.socket.emit("drawing", {
                  x0: previous.clientX,
                  y0: previous.clientY,
                  x1: (event as PointerEvent).clientX,
                  y1: (event as PointerEvent).clientY,
                  color: that.color,
                  pointerType: (event as PointerEvent).pointerType,
                  pressure: (event as PointerEvent).pressure,
                  width: (event as PointerEvent).width,
                  globalCompositeOperation: "destination-out",
                  user: userData ? userData.name : null,
                });
              }
            });
          }
        }
      },
    });
  }

  render() {
    return html` <canvas></canvas> <canvas id="secondCanvas"></canvas> `;
  }
}
