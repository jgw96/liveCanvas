import {
  LitElement,
  css,
  html
} from "lit";
import { customElement, property, state } from 'lit/decorators.js';

@customElement("session-item")
export class SessionItem extends LitElement {
  @property({ type: Object }) session: any = null;

  @state() codeGenerated: boolean = false;

  static get styles() {
    return css`
      :host {
        min-height: 8em;

        margin-bottom: 14px;
      }

      sl-card::part(body){
        font-weight: bold;
        font-size: 1.3em;
      }

      sl-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        border-radius: 8px;
      }

      #session-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #session-info h3 {
        margin-right: 10px;
        margin-top: 0px;
      }

      #session-info p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        margin-top: 0px;
      }

      #card-actions {
        display: flex;
        justify-content: space-between;
      }

      #card-actions a {
        font-size: var(--sl-button-font-size-medium);
        height: var(--sl-input-height-medium);
        line-height: calc(
          var(--sl-input-height-medium) - var(--sl-input-border-width) * 2
        );
        border-radius: var(--sl-input-border-radius-medium);
        background-color: var(--sl-color-primary-600);
        color: var(--sl-color-neutral-0);
        display: inline-flex;
        align-items: stretch;
        justify-content: center;
        /* width: 100%; */
        border-style: solid;
        border-width: var(--sl-input-border-width);
        font-family: var(--sl-input-font-family);
        font-weight: var(--sl-font-weight-semibold);
        text-decoration: none;
        user-select: none;
        white-space: nowrap;
        vertical-align: middle;
        padding: 0px;
        padding-left: 10px;
        padding-right: 10px;
        transition: var(--sl-transition-fast) background-color,
          var(--sl-transition-fast) color, var(--sl-transition-fast) border,
          var(--sl-transition-fast) box-shadow;
        cursor: pointer;
      }

      #code {
        margin-bottom: 2em;
        margin-top: 10px;
        display: flex;
        justify-content: end;
        align-items: center;
        justify-content: center;

        height: 128px;
      }

      @media (max-width: 1030px) {
        :host {
          width: 100%;
        }

        #new-button {
          width: 100%;
        }

        sl-card {
          margin-bottom: 10px;
        }
      }

      @media (max-width: 545px) {
        #share-button,
        #delete-button,
        #qr-button {
          padding-left: initial;
          padding-right: initial;
          margin-right: initial;
        }
      }

      @media (horizontal-viewport-segments: 2) {
        sl-card {
          width: 100%;
        }

        :host {
          width: 100%;
          margin: 0;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    console.log(this.session);
  }

  async generateCode() {
    this.codeGenerated = true;

    await this.updateComplete;

    new (window as any).QRCode(this.shadowRoot?.querySelector("#code"), {
      text: `https://www.live-canvas.app/${this.session.session}`,
      width: 128,
      height: 128,
      colorDark: "#000000",
      colorLight: "#ffffff",
    });
  }

  async share(session: any) {
    if ((navigator as any).share) {
      await (navigator as any).share({
        url: session.id,
        text: "Join me on my board",
        title: "Live Canvas",
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${location.href}`);
    }
  }

  async delete(session: string) {
    const module = await import("../services/sessions");
    const filtered = await module.deleteSession(session);

    if (filtered) {
      let event = new CustomEvent("deleted", {
        detail: {
          sessions: filtered,
        },
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    return html`
      <sl-card>
        ${this.session.name}
        ${this.codeGenerated ? html`<div id="code"></div>` : null}

        <div id="card-actions" slot="footer">
          <sl-button
            variant="danger"
            @click="${() => this.delete(this.session.id)}"
            id="delete-button"
          >
            Delete
          </sl-button>

          <div>
            <sl-button
              id="share-button"
              @click="${() => this.share(this.session)}"
              variant="success"
              >Share</sl-button
            >

            <!--<fast-button ?disabled="${this
              .codeGenerated}" id="qr-button" @click="${() =>
              this.generateCode()}">
              QR Code
            </fast-button>-->

            <a href="${`/${this.session.id}`}">Resume</a>
          </div>
        </div>
      </sl-card>
    `;
  }
}
