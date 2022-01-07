import { LitElement, css, html } from "lit";
import { customElement, property } from 'lit/decorators.js';

import { getDevices } from "../services/graph-api";

@customElement("app-toolbar")
export class AppToolbar extends LitElement {
  @property({ type: String }) activeMode: string = "pen";
  @property({ type: Boolean }) showModeToast: boolean = false;
  @property({ type: Boolean }) confirmDelete: boolean = false;

  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        bottom: 16px;
        left: 16px;
        background: white;
        padding: 8px;
        border-radius: 22px;
        box-shadow: 0 0 10px 4px #686bd261;

        animation-name: fadein;
        animation-duration: 280ms;
      }

      @media (prefers-color-scheme: dark) {
        :host {
          background-color: var(--sl-color-neutral-0);
          box-shadow: none;
          border-color: var(--sl-color-neutral-300);
          border-style: solid;
          border-width: var(--sl-input-border-width);
        }
      }

      button {
        height: 40px;
        border-radius: 50%;
        width: 40px;
        border: solid 2px black;
        cursor: pointer;
      }

      #penButton img {
        height: 22px;
        width: 22px;
      }

      #redButton {
        background: red;
      }

      #blueButton {
        background: blue;
      }

      #yellowButton {
        background: yellow;
      }

      #greenButton {
        background: green;
      }

      #blackButton {
        background: black;
      }

      #penButton,
      #eraserButton,
      #clearButton,
      #saveButton,
      #presentButton {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
      }

      @media (prefers-color-scheme: dark) {
        #penButton,
        #eraserButton,
        #clearButton,
        #saveButton,
        #presentButton {
          background: black;
          color: white;
        }
      }

      #penButton img,
      #eraserButton img,
      #clearButton img,
      #saveButton img,
      #presentButton img {
        height: 18px;
        width: 18px;
      }

      #innerBlock {
        display: flex;
        justify-content: space-between;
        width: 28em;
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

      @media (min-width: 800px) {
        #innerBlock {
          flex-direction: column;
          width: 2.8em;
          height: 26em;
          padding-top: 8px;
          padding-bottom: 8px;
          justify-content: space-between;
          align-items: center;
        }
      }

      @media (max-width: 545px) {
        :host {
          left: 0;
          bottom: 0;
          border: none;

          padding-left: 6px;
          padding-right: 6px;
          border-radius: 0px 20px 0px 0px;
        }

        #innerBlock {
          width: 100%;
          flex-direction: column;
          height: 100%;
          justify-content: flex-end;
          gap: 10px;
        }
      }

      @media(horizontal-viewport-segments: 2) {
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

  handleColor() {
    const color = (this.shadowRoot?.querySelector("sl-color-picker") as any)?.value;

    let event = new CustomEvent("color-picked", {
      detail: {
        color,
      },
    });
    this.dispatchEvent(event);
  }

  pickColor(color: string) {
    console.log(color);

    let event = new CustomEvent("color-picked", {
      detail: {
        color,
      },
    });
    this.dispatchEvent(event);
  }

  penMode(mode: string) {
    console.log("mode", mode);
    let event = new CustomEvent("mode-picked", {
      detail: {
        mode,
      },
    });
    this.dispatchEvent(event);

    this.activeMode = mode;

    const modeToast: any = this.shadowRoot?.querySelector("#modeToast");
    modeToast?.toast();
  }

  clear() {
    this.cancel();

    let event = new CustomEvent("clear-picked", {
      detail: {},
    });
    this.dispatchEvent(event);
  }

  clearPrompt() {
    const dialog = this.shadowRoot?.querySelector("#clearCanvasDialog");
    (dialog as any).show();
  }

  cancel() {
    const dialog = this.shadowRoot?.querySelector("#clearCanvasDialog");
    (dialog as any).hide();
  }

  save() {
    let event = new CustomEvent("save-picked", {
      detail: {},
    });
    this.dispatchEvent(event);
  }

  present() {
    let event = new CustomEvent("present-picked", {
      detail: {},
    });
    this.dispatchEvent(event);
  }

  async shareToDevice() {
    const devices = await getDevices();
    console.log(devices);
  }

  render() {
    return html`
      <div id="innerBlock">
        <sl-color-picker value="${window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black"}" @sl-change="${() => this.handleColor()}"></sl-color-picker>
        <button
          id="redButton"
          aria-label="red color"
          @click="${() => this.pickColor("red")}"
        ></button>
        <button
          id="blueButton"
          aria-label="blue color"
          @click="${() => this.pickColor("blue")}"
        ></button>
        <button
          id="yellowButton"
          aria-label="yellow color"
          @click="${() => this.pickColor("yellow")}"
        ></button>
        <button
          id="greenButton"
          aria-label="green color"
          @click="${() => this.pickColor("green")}"
        ></button>
        <button
          id="blackButton"
          aria-label="black color"
          @click="${() => this.pickColor("black")}"
        ></button>

        <button id="clearButton" @click="${() => this.clearPrompt()}">
          <sl-icon name="trash"></sl-icon>
        </button>
        <button id="saveButton" @click="${() => this.save()}">
          <sl-icon name="download"></sl-icon>
        </button>
        <!--<button id="presentButton" @click="${() =>
          this.present()}"><img src="/assets/tv-outline.svg" alt="present icon"></button>-->
        <!--<button id="devicesButton" @click="${() =>
          this.shareToDevice()}">Device</button>-->

        <sl-alert id="modeToast" duration="3000" closable>
          <strong>${this.activeMode} mode</strong>
        </sl-alert>
        <sl-dialog
          id="clearCanvasDialog"
          label="Clear Canvas?"
          class="dialog-overview"
        >
          Are you sure you would like to clear the canvas? This action cannot
          be undone.

          <sl-button slot="footer" @click="${() => this.cancel()}"
            >Cancel</sl-button
          >
          <sl-button slot="footer" variant="danger" @click="${() => this.clear()}"
            >Clear</sl-button
          >
        </sl-dialog>

        ${this.activeMode === "pen"
          ? html`<button
              id="eraserButton"
              @click="${() => this.penMode("erase")}"
            >
              <sl-icon name="eraser"></sl-icon>
            </button>`
          : html`<button id="penButton" @click="${() => this.penMode("pen")}">
              <sl-icon name="pen"></sl-icon>
            </button>`}
      </div>
    `;
  }
}
