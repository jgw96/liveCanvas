import { LitElement, css, html, customElement, property, internalProperty } from "lit-element";

@customElement("session-item")
export class SessionItem extends LitElement {
  @property({ type: Object }) session: any = null;

  @internalProperty() codeGenerated: boolean = false;

  static get styles() {
    return css`
      :host {
        width: 24em;
        min-height: 8em;

        margin-bottom: 14px;
      }

      fast-card {
        --background-color: white;
        padding-left: 12px;
        padding-right: 12px;
        padding-bottom: 12px;

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
      }

      #session-info p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      #card-actions {
        display: flex;
        justify-content: space-between;
      }

      #card-actions fast-anchor {
        background-color: var(--app-color-primary);
        border-radius: 22px;

        padding-left: 6px;
        padding-right: 6px;
      }

      #share-button, #delete-button, #qr-button {
        margin-right: 2px;
        border-radius: 22px;

        padding-left: 6px;
        padding-right: 6px;
      }

      #delete-button {
        background: red;
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

      @media (max-width: 600px) {
        fast-card {
          width: 100%;
        }

        :host {
          width: 100%;
        }

        #new-button {
          width: 100%;
        }
      }

      @media (screen-spanning: single-fold-vertical) {
        fast-card {
          width: 94.4%;
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
        url: session.session,
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
      let event = new CustomEvent('deleted', {
        detail: {
          sessions: filtered
        }
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    return html`
      <fast-card>
        <div id="session-info">
          <h3>${this.session.date}</h3>
          <p>ID: ${this.session.session}</p>
        </div>

        ${this.codeGenerated ? html`<div id="code"></div>` : null}

        <div id="card-actions">
          <fast-button @click="${() => this.delete(this.session.session)}" id="delete-button">
            Delete
          </fast-button>

          <div>
            <fast-button
              id="share-button"
              @click="${() => this.share(this.session)}"
              >Share</fast-button
            >

            <fast-button ?disabled="${this.codeGenerated}" id="qr-button" @click="${() => this.generateCode()}">
              QR Code
            </fast-button>

            <fast-anchor href="${`/${this.session.session}`}"
              >Resume</fast-anchor
            >
          </div>
        </div>
      </fast-card>
    `;
  }
}
