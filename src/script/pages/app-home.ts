import { LitElement, css, html, customElement, property } from 'lit-element';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { randoRoom } from '../services/utils';
import { Router } from '@vaadin/router';

import '../components/toolbar';

declare var io: any;

@customElement('app-home')
export class AppHome extends LitElement {

  @property() ctx: CanvasRenderingContext2D | null | undefined = null;
  @property() color: string = 'black';
  @property() mode: string = 'pen';
  @property({ type: Boolean }) gotContacts: boolean = false;

  room: any = null;
  socket: any = null;
  contacts: any[] = [];

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

      pwa-install {
        position: absolute;
        top: 11px;
        right: 8em;
        z-index: 9999;
      }

      pwa-install::part(openButton) {
        background: var(--app-color-primary);
      }

      #newLive {
        position: fixed;
        bottom: 16px;
        right: 16px;

        background: var(--app-color-primary);
        color: white;
        border: none;
        border-radius: 2px;
        padding: 10px;
        font-size: 16px;
      }

      #shareRoom {
        position: fixed;
        bottom: 16px;
        right: 16px;

        background: var(--app-color-secondary);
        color: white;
        border: none;
        border-radius: 2px;
        padding: 10px;
        font-size: 16px;
      }

      #contactsAlert {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #808080b8;
        backdrop-filter: blur(8px);
        z-index: 8;

        animation-name: fadein;
        animation-duration: 300ms;
      }

      #contactsBlock {
        height: 12em;
        width: 20em;
        background: white;
        border-radius: 6px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      #contactsBlock h3 {
        margin-top: 0;
      }

      #contactsBlock button {
        background: var(--app-color-primary);
        color: white;
        border-radius: 22px;
        border: none;
        paddinG: 8px;
        padding-left: 14px;
        padding-right: 14px;
        font-weight: bold;
      }

      #secondCanvas {
        pointer-events: none;
      }

      @media(max-width: 600px) {
        #newLive {
          right: 6px;
          bottom: 18px;
          border-radius: 22px;
          padding-left: 14px;
          padding-right: 14px;
        }

        pwa-install {
          display: none;
        }
      }

      @keyframes fadein {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    this.setupCanvas();
    await this.setupEvents();

    if (location.pathname.length > 1) {
      // in room

      this.socket = this.socket_connect(location.pathname);

      this.setupLiveEvents();
    }

    window.addEventListener('resize', () => this.setupCanvas());
  }

  setupCanvas() {
    const canvas = this.shadowRoot?.querySelector('canvas');
    this.ctx = canvas?.getContext('2d');

    if (canvas) {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    }

    if (this.ctx) {
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
    }
  }

  newLive() {
    const room = randoRoom();
    console.log(room);

    if (room) {
      Router.go(`/${room}`);
    }
  }

  socket_connect(room: any) {
    return io('https://live-canvas-server.azurewebsites.net/', {
      query: 'r_var=' + room
    });
  }

  async setupEvents() {
    const module = await import('pointer-tracker');

    const canvas = (this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement);

    const cursorCanvas: HTMLCanvasElement | null | undefined = this.shadowRoot?.querySelector('#secondCanvas');
    const cursorContext = cursorCanvas?.getContext("bitmaprenderer");

    if (cursorCanvas) {
      cursorCanvas.width = window.innerWidth;
      cursorCanvas.height = window.innerHeight;
    }

    const offscreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    const offscreenContext = offscreen.getContext('2d');

    if (offscreenContext) {
      offscreenContext.lineWidth = 4;
    }

    let that = this;

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

        if (that.mode === 'pen') {
          if (that.ctx) {
            that.ctx.globalCompositeOperation = 'source-over';
          }

          for (const pointer of changedPointers) {
            const previous = previousPointers.find((p) => p.id === pointer.id);

            if (that.ctx && previous) {
              that.ctx.strokeStyle = that.color;

              if ((pointer.nativePointer as PointerEvent).pointerType === 'pen') {
                let tweakedPressure = (pointer.nativePointer as PointerEvent).pressure * 6;
                that.ctx.lineWidth = (pointer.nativePointer as PointerEvent).width + tweakedPressure;
              }
              else if ((pointer.nativePointer as PointerEvent).pointerType === 'touch') {
                that.ctx.lineWidth = (pointer.nativePointer as PointerEvent).width - 20;
              }
              else if ((pointer.nativePointer as PointerEvent).pointerType === 'mouse') {
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
              offscreenContext?.arc(event.clientX, event.clientY, 10, 0, 2 * Math.PI);
              offscreenContext?.stroke();

              let bitmapOne = offscreen.transferToImageBitmap();
              cursorContext?.transferFromImageBitmap(bitmapOne);

              if (that.socket) {
                that.socket.emit('drawing', {
                  x0: previous.clientX,
                  y0: previous.clientY,
                  x1: (event as PointerEvent).clientX,
                  y1: (event as PointerEvent).clientY,
                  color: that.color,
                  pointerType: (event as PointerEvent).pointerType,
                  pressure: (event as PointerEvent).pressure,
                  width: (event as PointerEvent).width
                });
              }
            }

          }
        }
        else if (that.mode === 'erase') {
          if (that.ctx) {
            that.ctx.globalCompositeOperation = 'destination-out';

            that.ctx.lineWidth = 18;

            changedPointers.forEach((pointer) => {
              const previous = previousPointers.find(p => p.id === pointer.id);

              if (that.ctx && previous) {
                that.ctx.beginPath();
                that.ctx.moveTo(previous.clientX, previous.clientY);
                for (const point of pointer.getCoalesced()) {
                  that.ctx.lineTo(point.clientX, point.clientY);
                }
                that.ctx.stroke();
              }

            });
          }
        }

      },
    });
  }

  setupLiveEvents() {
    const cursorCanvas: HTMLCanvasElement | null | undefined = this.shadowRoot?.querySelector('secondCanvas');
    const cursorContext = cursorCanvas?.getContext("bitmaprenderer");

    this.socket.on('drawing', (data: any) => {
      console.log('data', data);
      console.log(this.ctx);
      if (this.ctx) {
        this.ctx.strokeStyle = data.color;

        if (data.pointerType === 'pen') {
          let tweakedPressure = data.pressure * 6;
          this.ctx.lineWidth = data.width + tweakedPressure;
        }

        else if (data.pointerType === 'touch') {
          this.ctx.lineWidth = data.width - 20;
        }
        else if (data.pointerType === 'mouse') {
          this.ctx.lineWidth = 4;
        }

        const offscreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
        const offscreenContext = offscreen.getContext('2d');

        offscreenContext?.beginPath();
        offscreenContext?.arc(data.x0, data.y0, 50, 0, 2 * Math.PI)
        offscreenContext?.stroke();

        let bitmapOne = offscreen.transferToImageBitmap();
        cursorContext?.transferFromImageBitmap(bitmapOne);

        /* offscreenContext?.clearRect(0, 0, window.innerWidth, window.innerHeight);
 
         let bitmapTwo = offscreen.transferToImageBitmap();
         cursorContext?.transferFromImageBitmap(bitmapTwo);*/


        this.ctx.beginPath();

        this.ctx.moveTo(data.x0, data.y0);


        this.ctx.lineTo(data.x1, data.y1);


        this.ctx.stroke();
      }

    });
  }

  handleColor(color: string) {
    this.color = color;
  }

  handleMode(mode: string) {
    this.mode = mode;
  }

  async share() {
    const supported = ('contacts' in navigator && 'ContactsManager' in window);

    if (supported) {
      const props = ['name', 'email'];
      const opts = { multiple: true };

      const contacts = await (navigator as any).contacts.select(props, opts);

      this.contacts = contacts;
      this.sendInvite();
    }
    else {
      await (navigator as any).share({
        url: location.href,
        text: 'Join me on my board',
        title: 'Live Canvas'
      })
    }
  }

  sendInvite() {
    let email = '';
    this.contacts.forEach((contact) => {
      email = email + "," + contact.email[0]
    })
    var subject = 'Join me on my board';
    var emailBody = '';
    (document as any).location = "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;

    this.contacts = [];
  }

  render() {
    return html`
      <div>
        <pwa-install>Install Live Canvas</pwa-install>

        <canvas></canvas>
        <canvas id="secondCanvas"></canvas>

        <app-toolbar @mode-picked="${(e: CustomEvent) => this.handleMode(e.detail.mode)}" @color-picked="${(e: CustomEvent) => this.handleColor(e.detail.color)}"></app-toolbar>
      </div>

      ${location.pathname.length === 1 ? html`<button id="newLive" @click="${this.newLive}">New Session</button>` : html`<button id="shareRoom" @click="${this.share}">Invite</button>`}
    `;
  }
}