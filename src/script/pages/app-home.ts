import { LitElement, css, html, customElement, property } from "lit-element";

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import "@pwabuilder/pwainstall";
import { randoRoom, releaseWakeLock, requestWakeLock } from "../services/utils";
import { Router } from "@vaadin/router";

// import { get } from 'idb-keyval';

import "../components/toolbar";

import { socket_connect } from "../services/handle-socket";
import {
  changeColor,
  handleEvents,
  handleLiveEvents,
  setupCanvas,
} from "../services/handle-canvas";
import { fileSave } from "browser-fs-access";

declare var io: any;

@customElement("app-home")
export class AppHome extends LitElement {
  @property() ctx: CanvasRenderingContext2D | null | undefined = null;
  @property() color: string = "black";
  @property() mode: string = "pen";
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

      #newLive img,
      #endButton img {
        width: 18px;
        margin-right: 8px;
      }

      #endButton,
      #shareRoom {
        cursor: pointer;

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
        padding: 8px;
        padding-left: 14px;
        padding-right: 14px;
        font-weight: bold;
      }

      #secondCanvas,
      #thirdCanvas {
        pointer-events: none;
      }

      #sessionToast {
        z-index: 9999;
        position: absolute;
        bottom: 14px;
        right: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: white;
        color: black;
        box-shadow: rgb(104 107 210 / 38%) 0px 0px 10px 4px;
        border-radius: 6px;
        padding-top: 6px;
        padding-bottom: 6px;
        padding-left: 12px;
        padding-right: 12px;

        animation-name: fadein;
        animation-duration: 400ms;
      }

      fast-button {
        border-radius: 22px;
      }

      #sessionToast fast-button {
        margin-left: 14px;
      }

      #sessionToast fast-button::part(control) {
        font-weight: bold;
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

      @media(screen-spanning: single-fold-vertical) {
        #endPromptContainer {
          width: 50vw;
          right: 0;
          left: initial;
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

        box-shadow: #00000024 0px 1px 8px 3px
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

      #endPromptActions fast-button {
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

      @media (max-width: 600px) {
        #newLive {
          right: 6px;
          bottom: 15px;
          border-radius: 22px;
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

    if (location.pathname.length > 1 || location.search === "?startLive") {
      // in room

      this.socket = socket_connect(location.pathname);

      await this.setupEvents();

      this.setupLiveEvents();

      if ('wakeLock' in navigator) {
        // Screen Wake Lock API supported 🎉

        await requestWakeLock();
      }

      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 5000);
    } else {
      await this.setupEvents();
    }

    window.addEventListener("resize", () => {
      this.setupCanvas();
      this.setupEvents();
    });
  }

  setupCanvas() {
    const canvas = this.shadowRoot?.querySelector("canvas");
    if (canvas) {
      this.ctx = setupCanvas(canvas);
    }
  }

  newLive() {
    const room = randoRoom();
    console.log(room);

    (navigator as any).setAppBadge();

    if (room) {
      Router.go(`/${room}`);
    }
  }

  async setupEvents() {
    const canvas = this.shadowRoot?.querySelector(
      "canvas"
    ) as HTMLCanvasElement;

    const cursorCanvas:
      | HTMLCanvasElement
      | null
      | undefined = this.shadowRoot?.querySelector("#secondCanvas");

    await handleEvents(
      canvas,
      cursorCanvas ? cursorCanvas : null,
      this.mode,
      this.color,
      this.ctx,
      this.socket
    );
  }

  async setupLiveEvents() {
    const cursorCanvas:
      | HTMLCanvasElement
      | null
      | undefined = this.shadowRoot?.querySelector("#secondCanvas");
      
    const thirdCanvas:
      | HTMLCanvasElement
      | null
      | undefined = this.shadowRoot?.querySelector("#thirdCanvas");

    const thirdContext = thirdCanvas?.getContext("2d");

    if (thirdCanvas && thirdContext && cursorCanvas) {
      await handleLiveEvents(thirdCanvas, thirdContext, this.socket);
    }
  }

  handleColor(color: string) {
    this.color = color;

    changeColor(this.color);
  }

  handleMode(mode: string) {
    this.mode = mode;
  }

  async share() {
    const supported = "contacts" in navigator && "ContactsManager" in window;

    if (supported) {
      const props = ["name", "email"];
      const opts = { multiple: true };

      const contacts = await (navigator as any).contacts.select(props, opts);

      this.contacts = contacts;
      this.sendInvite();
    } else {
      await (navigator as any).share({
        url: location.href,
        text: "Join me on my board",
        title: "Live Canvas",
      });
    }
  }

  sendInvite() {
    let email = "";
    this.contacts.forEach((contact) => {
      email = email + "," + contact.email[0];
    });
    var subject = "Join me on my board";
    var emailBody = "";
    (document as any).location =
      "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;

    this.contacts = [];
  }

  handleClear() {
    const canvas = this.shadowRoot?.querySelector("canvas");

    if (this.ctx && canvas) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.ctx.fillStyle = 'white';
      this.ctx?.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  async handleSave() {
    const canvas = this.shadowRoot?.querySelector("canvas");

    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await fileSave(blob, {
            fileName: "Untitled.png",
            extensions: [".png"],
          });
        }
      })
    }
  }

  endSession() {
    this.endPrompt = true;
  }

  async end() {
    Router.go("/");

    (navigator as any).clearAppBadge();

    await releaseWakeLock();
  }

  no() {
    this.endPrompt = false;
  }

  async handlePresent() {
    // @ts-ignore
    const presentationRequest = new PresentationRequest([location.href]);
    (navigator as any).presentation.defaultRequest = presentationRequest;
    presentationRequest.start();
  }

  render() {
    return html`
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

      ${this.showToast
        ? html`
            <div id="sessionToast">
              You have started a new session

              <fast-button appearance="lightweight" @click="${this.share}"
                >Invite</fast-button
              >
            </div>
          `
        : null}
      ${this.endPrompt
        ? html`
            <div id="endPromptContainer">
              <div id="endPrompt">
                <h2>End Session?</h2>

                <div id="endPromptActions">
                  <fast-button @click="${this.no}">No</fast-button>
                  <fast-button
                    id="end-button"
                    appearance="accent"
                    @click="${this.end}"
                    >End</fast-button
                  >
                </div>
              </div>
            </div>
          `
        : null}
      ${location.pathname.length > 1
        ? html`<button id="endButton" @click="${this.endSession}">
            <img src="/assets/close.svg" alt="close session" />
          </button>`
        : null}
      ${location.pathname.length === 1
        ? html`<fast-button
            appearance="accent"
            id="newLive"
            @click="${this.newLive}"
          >
            <img src="/assets/add.svg" alt="add icon" />
            <span>New Session</span></fast-button
          >`
        : html`<button id="shareRoom" @click="${this.share}">
            <img src="/assets/share.svg" alt="share icon" />
          </button>`}
    `;
  }
}
