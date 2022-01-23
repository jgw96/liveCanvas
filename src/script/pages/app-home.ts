import { LitElement, css, html } from "lit";

import { customElement, property, state } from "lit/decorators.js";

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import "@pwabuilder/pwainstall";
import { randoRoom, releaseWakeLock, requestWakeLock } from "../services/utils";
import { Router } from "@vaadin/router";

import "../components/toolbar";
import "../components/conn-manager";
import "../components/app-contacts";

import { socket_connect } from "../services/handle-socket";
import {
  setupCanvas,
  handleEvents,
  handleLiveEvents,
  changeMode,
  changeColor
} from "../services/handle-canvas";
import { get } from "idb-keyval";

@customElement("app-home")
export class AppHome extends LitElement {
  @property() ctx: CanvasRenderingContext2D | null | undefined = null;
  @property() color: string = "black";
  @property() mode: string = "pen";
  @property({ type: Boolean }) gotContacts: boolean = false;
  @property({ type: Boolean }) showToast: boolean = false;
  @property({ type: Boolean }) endPrompt: boolean = false;

  @state() handle: any | undefined;
  @state() showCopyToast: boolean = false;
  @state() socket: any = null;

  room: any = null;
  contacts: any[] = [];

  newRoom: string | undefined = undefined;

  static get styles() {
    return css`
      :host {
        padding: 16px;
      }

      canvas {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        touch-action: none;
      }

      pwa-install {
        position: absolute;
        top: 14px;
        right: 12em;
        z-index: 99999;

        display: none;
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

        display: flex;
        align-items: center;

        padding-left: 6px;
        padding-right: 6px;

        animation-name: fadein;
        animation-duration: 280ms;
      }

      #newLive::part(content) {
        display: flex;
        align-items: center;
      }

      #endButton,
      #shareRoom {
        animation-name: fadein;
        animation-duration: 200ms;
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
        padding: 8px;
        padding-left: 14px;
        padding-right: 14px;
        font-weight: bold;
      }

      #secondCanvas,
      #thirdCanvas {
        pointer-events: none;
      }

      sl-button {
        border-radius: 22px;
      }

      #endButton {
        position: fixed;
        bottom: 16px;
        right: 6em;
      }

      #endPromptContainer {
        z-index: 99999;
        position: fixed;
        inset: 0px;
        background: rgb(169 169 169 / 59%);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 8em;
        animation-name: fadein;
        animation-duration: 300ms;
      }

      @media (horizontal-viewport-segments: 2) {
        #endPromptContainer {
          width: 50vw;
          right: 0;
          left: initial;
        }
      }

      @media (screen-spanning: single-fold-horizontal) {
        #endPromptContainer {
          height: 50vh;
          right: 0;
          left: 0;
          padding-bottom: 0;
        }
      }

      #endPrompt {
        background: white;
        width: 20em;
        height: 9em;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        padding: 8px;
        padding-top: 0px;

        box-shadow: #00000024 0px 1px 8px 3px;
      }

      #endPrompt h2 {
        color: black;
        margin-top: 12px;
        margin-left: 6px;
        font-size: 22px;
      }

      #endPromptActions {
        display: flex;
        justify-content: flex-end;
        padding: 16px;
        padding-bottom: 0;
        padding-right: 0;
      }

      #endPromptActions sl-button {
        width: 5em;
      }

      #end-button {
        margin-left: 6px;
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

      @media (max-width: 545px) {
        #newLive {
          right: 6px;
          bottom: 15px;
          border-radius: 22px;
        }

        #shareRoom {
          bottom: 4.4em;
        }

        #endButton {
          bottom: 6px;
          right: 6px;
        }

        pwa-install {
          display: none;
        }

        #newLive {
          border-radius: 50%;
          height: 48px;
          width: 36px;
          right: 16px;
        }

        #newLive span {
          display: none;
        }

        #newLive img {
          margin: 0;
        }
      }

      @media (horizontal-viewport-segments: 2) {
        sl-dialog::part(panel) {
          right: 21px;
          left: initial;
          position: fixed;
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
    await this.setupCanvas();

    if (location.pathname.length > 1 || location.search === "?startLive") {
      // in room

      this.socket = socket_connect(location.pathname);

      await this.setupEvents();

      this.setupLiveEvents();

      if ("wakeLock" in navigator) {
        // Screen Wake Lock API supported 🎉

        await requestWakeLock();
      }
    } else {
      await this.setupEvents();
    }
  }

  async handleResize() {
    const canvas = this.shadowRoot?.querySelector(
      "canvas"
    ) as HTMLCanvasElement;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (this.ctx) {
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 5;
    }

    const canvasState = await (get("canvasState") as any);

    if (canvasState) {
      const tempImage = new Image();
      tempImage.onload = () => {
        this.ctx?.drawImage(tempImage, 0, 0);
      };
      tempImage.src = canvasState;
    }
  }

  async setupCanvas() {
    const canvas = this.shadowRoot?.querySelector("canvas");
    if (canvas) {
      // const possibleCtx = await setupCanvas(canvas);
      const possibleCtx = await setupCanvas(canvas);

      if (possibleCtx) {
        this.ctx = possibleCtx;
      }
    }
  }

  async newLive() {
    const room = randoRoom();
    this.newRoom = room;

    const dialog = this.shadowRoot?.querySelector("#newSessionDialog");
    (dialog as any).show();
  }

  startNewSession() {
    if ((navigator as any).setAppBadge) {
      (navigator as any).setAppBadge();
    }

    if (this.newRoom) {
      console.log("room", this.newRoom);
      Router.go(`/${this.newRoom}`);
    }
  }

  async setupEvents() {
    const canvas = this.shadowRoot?.querySelector(
      "canvas"
    ) as HTMLCanvasElement;

    const cursorCanvas: HTMLCanvasElement | null | undefined =
      this.shadowRoot?.querySelector("#secondCanvas");

      if (canvas && cursorCanvas) {
        await handleEvents(canvas, cursorCanvas, this.color, this.ctx, this.socket);
      }
  }

  async setupLiveEvents() {
    /*const cursorCanvas: HTMLCanvasElement | null | undefined =
      this.shadowRoot?.querySelector("#secondCanvas");*/

    const thirdCanvas: HTMLCanvasElement | null | undefined =
      this.shadowRoot?.querySelector("#thirdCanvas");

    const thirdContext = thirdCanvas?.getContext("2d");

    if (thirdCanvas && thirdContext /*&& cursorCanvas*/) {
      await handleLiveEvents(thirdCanvas, thirdContext, this.socket);
      // await handleLiveEventsOffscreen(thirdCanvas, thirdContext, this.socket, cursorCanvas);
    }
  }

  handleColor(color: string) {
    this.color = color;
    changeColor(this.color);
  }

  handleMode(mode: "pen" | "erase") {
    this.mode = mode;
    changeMode(mode);
  }

  async share() {
    const supported = "contacts" in navigator && "ContactsManager" in window;

    if (supported) {
      const props = ["name", "email"];
      const opts = { multiple: true };

      const contacts = await (navigator as any).contacts.select(props, opts);

      this.contacts = contacts;
      this.sendInvite();
    } else if ((navigator as any).share) {
      await (navigator as any).share({
        url: location.href,
        text: "Join me on my board",
        title: "Live Canvas",
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${location.href}`);

      const copyToast: any = this.shadowRoot?.querySelector("#copyToast");
      copyToast.toast();
    }
  }

  handleContacts(contacts: any) {
    console.log(contacts);

    this.contacts = contacts.detail.data;
    this.sendInvite();
  }

  sendInvite() {
    let email = "";
    this.contacts.forEach((contact) => {
      console.log("contact", contact);
      if (email.length > 0) {
        email = email + "," + contact;
      } else {
        email = contact;
      }
    });
    let subject = "Join me on my board";
    let emailBody = `Join me on this whiteboard: ${location.href}`;
    (document as any).location =
      "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;

    this.contacts = [];
  }

  handleClear() {
    const canvas = this.shadowRoot?.querySelector("canvas");

    if (this.ctx && canvas) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      this.ctx.fillStyle = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "#181818"
        : "white";
      this.ctx?.fillRect(0, 0, canvas.width, canvas.height);
    }

    // clearDrawings();
  }

  async handleSave() {
    const canvas = this.shadowRoot?.querySelector("canvas");

    const fileModule = await import("browser-fs-access");

    const options = {
      fileName: "Untitled.png",
      extensions: [".png"],
    };

    if (canvas) {
      if (this.handle) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            this.handle = await fileModule.fileSave(blob, options, this.handle);
          }
        });
      } else {
        canvas.toBlob(async (blob) => {
          if (blob) {
            this.handle = await fileModule.fileSave(blob, options);
          }
        });
      }
    }
  }

  endSession() {
    const endSesionDialog = this.shadowRoot?.querySelector("#endSessionDialog");
    (endSesionDialog as any).show();
  }

  cancel() {
    const endSesionDialog = this.shadowRoot?.querySelector("#endSessionDialog");
    (endSesionDialog as any).hide();
  }

  async end() {
    Router.go("/");

    if ((navigator as any).clearAppBadge) {
      (navigator as any).clearAppBadge();
    }

    await releaseWakeLock();
  }

  async handlePresent() {
    // @ts-ignore
    const presentationRequest = new PresentationRequest([location.href]);
    (navigator as any).presentation.defaultRequest = presentationRequest;
    presentationRequest.start();
  }

  render() {
    return html`
      <sl-dialog
        id="endSessionDialog"
        label="End whiteboard session"
        class="dialog-overview"
      >
        Done with your whiteboard? You can get back to it from the home page.

        <sl-button slot="footer" @click="${() => this.cancel()}"
          >Cancel</sl-button
        >
        <sl-button slot="footer" variant="danger" @click="${() => this.end()}"
          >I'm Done</sl-button
        >
      </sl-dialog>

      <div>
        <pwa-install>Install Live Canvas</pwa-install>

        <canvas id="firstCanvas"></canvas>
        <canvas id="secondCanvas"></canvas>
        <canvas id="thirdCanvas"></canvas>

        <app-toolbar
          @clear-picked="${() => this.handleClear()}"
          @mode-picked="${(e: CustomEvent) => this.handleMode(e.detail.mode)}"
          @color-picked="${(e: CustomEvent) =>
            this.handleColor(e.detail.color)}"
          @save-picked="${() => this.handleSave()}"
          @present-picked="${() => this.handlePresent()}"
        ></app-toolbar>
      </div>

      <sl-alert id="copyToast" duration="3000" closable>
        <strong>URL copied to clipboard for sharing</strong>
      </sl-alert>

      ${this.socket && this.socket !== null
        ? html`<conn-manager .socket="${this.socket}"></conn-manager>`
        : null}
      ${location.pathname.length > 1
        ? html`<sl-button id="endButton" variant="danger" @click="${this.endSession}">
            I'm Done
          </button>`
        : null}
      ${location.pathname.length === 1
        ? html`<sl-button
            variant="accent"
            id="newLive"
            @click="${this.newLive}"
          >
            New whiteboard</sl-button
          >`
        : html`<app-contacts
            id="shareRoom"
            @got-contacts="${(ev: CustomEvent) => this.handleContacts(ev)}"
          ></app-contacts>`}
    `;
  }
}
