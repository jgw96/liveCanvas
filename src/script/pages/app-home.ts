import { LitElement, css, html, customElement, property } from 'lit-element';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { randoRoom } from '../services/utils';
import { Router } from '@vaadin/router';

import '../components/toolbar';
import { get } from 'idb-keyval';

declare var io: any;

@customElement('app-home')
export class AppHome extends LitElement {

  @property() ctx: CanvasRenderingContext2D | null | undefined = null;
  @property() color: string = 'black';
  @property() mode: string = 'pen';
  @property({ type: Boolean }) gotContacts: boolean = false;
  @property({ type: Boolean }) showToast: boolean = false;
  @property({ type: Boolean }) endPrompt: boolean = false;

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
        top: 14px;
        right: 8em;
        z-index: 99999;
      }

      pwa-install::part(openButton) {
        background: var(--app-color-primary);
      }

      @media all and (display-mode: standalone) {
        pwa-install {
          display: none;
        }
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

        display: flex;
        justify-content: center;
        align-items: center;
      }

      #newLive img, #endButton img {
        width: 18px;
        margin-right: 8px;
      }

      #endButton img {
        margin-right: 0;
        height: 28px;
        width: 28px;
        margin-top: 4px;
      }

      #shareRoom {
        position: fixed;
        bottom: 16px;
        right: 16px;

        background: var(--app-color-secondary);
        color: white;
        border: none;
        font-size: 16px;

        border-radius: 50%;
        width: 48px;
        height: 48px;
      }

      #shareRoom img {
        width: 22px;
        height: 22px;
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

      #secondCanvas, #thirdCanvas {
        pointer-events: none;
      }

      #sessionToast {
        z-index: 9999;
        position: absolute;
        bottom: 14px;
        right: 14px;
        background: var(--app-color-primary);
        color: white;
        padding: 12px;
        border-radius: 6px;

        animation-name: fadein;
        animation-duration: 400ms;
      }

      #sessionToast button {
        color: white;
        border: solid 2px white;
        background: none;
        border-radius: 24px;
        margin-left: 1em;
        padding-left: 10px;
        padding-right: 10px;
        padding-top: 4px;
        padding-bottom: 4px;
      }

      #endButton {
        position: fixed;
        bottom: 16px;
        right: 6em;
        width: 48px;
        height: 48px;
        border-width: initial;
        border-style: none;
        border-color: initial;
        border-image: initial;
        border-radius: 50%;
        background: #f84848;
      }

      #endPromptContainer {
        z-index: 99999;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: #686bd296;
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 8em;

        animation-name: fadein;
        animation-duration: 300ms;
      }

      #endPrompt {
        background: white;
        width: 20em;
        height: 9em;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      #endPrompt h5 {
        margin-left: 12px;
        font-size: 18px;
        margin-top: 14px;
      }

      #endPromptActions {
        display: flex;
        justify-content: flex-end;
        padding: 16px;
      }

      #noButton {
        color: red;
        background: none;
        border: none;
        font-weight: bold;
        width: 3em;
        height: 2em;
        font-size: 16px;

        background: #d3d3d3bf;
        border-radius: 18px;
        width: 4em;
        margin-right: 8px;
      }

      #endConfirm {
        color: var(--app-color-primary);
        background: none;
        border: none;
        font-weight: bold;
        width: 3em;
        height: 2em;
        font-size: 16px;

        background: #d3d3d3bf;
        border-radius: 18px;
        width: 4em;
      }

      @media(max-width: 600px) {
        #newLive {
          right: 6px;
          bottom: 18px;
          border-radius: 22px;
          padding-left: 14px;
          padding-right: 14px;
        }

        #endButton {
          bottom: 5.4em;
          right: 16px;
        }

        pwa-install {
          display: none;
        }

        #newLive {
          border-radius: 50%;
          height: 48px;
          width: 48px;
          right: 16px;
        }

        #newLive span {
          display: none;
        }

        #newLive img {
          margin: 0;
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

      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }

    window.addEventListener('resize', () => { this.setupCanvas(); this.setupEvents(); });
  }

  setupCanvas() {
    const canvas = this.shadowRoot?.querySelector('canvas');
    this.ctx = canvas?.getContext('2d', {
      // desynchronized: true
    });

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

    const userData: any = await get('userData');

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
                  width: (event as PointerEvent).width,
                  globalCompositeOperation: 'source-over',
                  user: userData ? userData.name : null
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

              if (that.socket && previous) {
                that.socket.emit('drawing', {
                  x0: previous.clientX,
                  y0: previous.clientY,
                  x1: (event as PointerEvent).clientX,
                  y1: (event as PointerEvent).clientY,
                  color: that.color,
                  pointerType: (event as PointerEvent).pointerType,
                  pressure: (event as PointerEvent).pressure,
                  width: (event as PointerEvent).width,
                  globalCompositeOperation: 'destination-out',
                  user: userData ? userData.name : null
                });
              }

            });
          }
        }

      },
    });
  }

  setupLiveEvents() {
    const cursorCanvas: HTMLCanvasElement | null | undefined = this.shadowRoot?.querySelector('#secondCanvas');
    const cursorContext = cursorCanvas?.getContext("bitmaprenderer");

    const thirdCanvas: HTMLCanvasElement | null | undefined = this.shadowRoot?.querySelector('#thirdCanvas');
    const thirdContext = thirdCanvas?.getContext("2d");

    if (thirdCanvas && thirdContext) {
      thirdCanvas.width = window.innerWidth;
      thirdCanvas.height = window.innerHeight;

      thirdContext.lineCap = 'round';
    }

    const offscreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    const offscreenContext = offscreen.getContext('2d');

    if (offscreenContext) {
      offscreenContext.font = '20px sans-serif';
    }

    this.socket.on('drawing', (data: any) => {
      console.log(data);
      if (thirdContext) {
        thirdContext.strokeStyle = data.color;

        thirdContext.globalCompositeOperation = data.globalCompositeOperation;

        if (data.pointerType === 'pen') {
          let tweakedPressure = data.pressure * 6;
          thirdContext.lineWidth = data.width + tweakedPressure;
        }

        else if (data.pointerType === 'touch') {
          thirdContext.lineWidth = data.width - 20;
        }
        else if (data.pointerType === 'mouse') {
          thirdContext.lineWidth = 4;
        }

        if (data.globalCompositeOperation === 'destination-out') {
          thirdContext.lineWidth = 18;
        }

        offscreenContext?.beginPath();
        offscreenContext?.arc(data.x0, data.y0, 10, 0, 2 * Math.PI)
        offscreenContext?.stroke();

        if (data.user) {
          offscreenContext?.fillText(data.user, data.x0 + 14, data.y0)
        }

        let bitmapOne = offscreen.transferToImageBitmap();
        cursorContext?.transferFromImageBitmap(bitmapOne);


        thirdContext.beginPath();

        thirdContext.moveTo(data.x0, data.y0);


        thirdContext.lineTo(data.x1, data.y1);


        thirdContext.stroke();
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

  handleClear() {
    this.ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  endSession() {
    // Router.go('/');
    this.endPrompt = true;
  }

  end() {
    Router.go('/');
  }

  no() {
    this.endPrompt = false;
  }

  render() {
    return html`
      <div>
        <pwa-install>Install Live Canvas</pwa-install>

        <canvas id="firstCanvas"></canvas>
        <canvas id="secondCanvas"></canvas>
        <canvas id="thirdCanvas"></canvas>

        <app-toolbar @clear-picked="${() => this.handleClear()}" @mode-picked="${(e: CustomEvent) => this.handleMode(e.detail.mode)}" @color-picked="${(e: CustomEvent) => this.handleColor(e.detail.color)}"></app-toolbar>
      </div>

      ${this.showToast ? html`
        <div id="sessionToast">
          You have started a new session

          <button @click="${this.share}">Invite</button>
        </div>
      ` : null}

      ${
      this.endPrompt ? html`
          <div id="endPromptContainer">
            <div id="endPrompt">
              <h5>End Session?</h5>

              <div id="endPromptActions">
                <button id="noButton" @click="${this.no}">No</button>
                <button id="endConfirm" @click="${this.end}">End</button>
              </div>
            </div>
          </div>
        ` : null
      }

      ${location.pathname.length > 1 ? html`<button id="endButton" @click="${this.endSession}"><img src="/assets/close.svg" alt="close session"></button>` : null}
      ${location.pathname.length === 1 ? html`<button id="newLive" @click="${this.newLive}"> <img src="/assets/add.svg" alt="add icon"> <span>New Session</span></button>` : html`<button id="shareRoom" @click="${this.share}"><img src="/assets/share.svg" alt="share icon"></button>`}
    `;
  }
}