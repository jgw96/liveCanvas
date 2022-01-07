import {
  LitElement,
  css,
  html,
} from "lit";
import { customElement, property, state } from 'lit/decorators.js';

@customElement("conn-manager")
export class ConnManager extends LitElement {
  @property({ type: Object }) socket: any = null;

  @state() errorMessage: string | undefined;
  @state() successMessage: string | undefined;
  @state() tryingMessage: string | undefined;

  static get styles() {
    return css`
      #errorToast,
      #successToast,
      #tryingToast {
        z-index: 9999;
        position: absolute;
        bottom: 14px;
        right: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: red;
        color: white;
        font-weight: bold;
        padding: 20px;

        box-shadow: rgb(104 107 210 / 38%) 0px 0px 10px 4px;
        border-radius: 6px;

        animation-name: fadein;
        animation-duration: 400ms;
      }

      #successToast {
        background: green;
      }

      #tryingToast {
        background: green;
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

  firstUpdated() {
    console.log('this.socket', this.socket);
    if (this.socket) {
      this.socket.on("disconnect", (reason: string) => {
        console.log("reason", reason);
        this.errorMessage = "Disconnected, attempting to re-connect";

        if (reason === "io server disconnect") {
          // the disconnection was initiated by the server, you need to reconnect manually
          this.socket.connect();
        }
        // else the socket will automatically try to reconnect
      });

      this.socket.on("reconnecting", () => {
        if (this.errorMessage) {
          setTimeout(() => {
            this.errorMessage = undefined;

            this.tryingMessage = "Attempting to re-connect";
          }, 2000);
        }
      });

      this.socket.on("reconnect", () => {
        if (this.tryingMessage) {
          this.tryingMessage = undefined;

          this.successMessage = "Succesfully re-connected";

          setTimeout(() => {
            this.successMessage = undefined;
          }, 3000);
        } else if (this.errorMessage) {
          this.errorMessage = undefined;

          this.successMessage = "Succesfully re-connected";

          setTimeout(() => {
            this.successMessage = undefined;
          }, 3000);
        }
      });

      this.socket.on("reconnect_failed", () => {
        if (this.tryingMessage) {
          this.tryingMessage = undefined;

          this.errorMessage = "Could not re-connect";
        }
      });
    }
  }

  render() {
    return html`${this.errorMessage
      ? html`<div id="errorToast">${this.errorMessage}</div>`
      : null}
    ${this.successMessage
      ? html`<div id="successToast">${this.successMessage}</div>`
      : null}
    ${this.tryingMessage
      ? html` <div id="tryingToast">${this.tryingMessage}</div> `
      : null}
    } `;
  }
}
