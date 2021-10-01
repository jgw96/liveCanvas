import { LitElement, css, html, customElement, property, internalProperty } from "lit-element";

@customElement("session-item")
export class SessionItem extends LitElement {
  @property({ type: Object }) session: any = null;

  @internalProperty() codeGenerated: boolean = false;

  static get styles() {
    return css`
      :host {
        min-height: 8em;

        margin-bottom: 14px;
      }

      fluent-card {
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

        padding-left: 6px;
        padding-right: 6px;
      }

      #share-button, #delete-button, #qr-button {
        margin-right: 2px;

        padding-left: 6px;
        padding-right: 6px;
      }

      #delete-button {
        background: red;
        color: white;
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

      @media (max-width: 800px) {
        fluent-card {
          width: 100%;
          margin-bottom: 10px;
        }

        :host {
          width: 100%;
        }

        #new-button {
          width: 100%;
        }
      }

      @media(max-width: 420px) {
        #share-button, #delete-button, #qr-button {
          padding-left: initial;
          padding-right: initial;
          margin-right: initial;
        }
      }

      @media (screen-spanning: single-fold-vertical) {
        fluent-card {
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
      <fluent-card>
        <div id="session-info">
          <h3>${this.session.date}</h3>
          <p>ID: ${this.session.session}</p>
        </div>

        ${this.codeGenerated ? html`<div id="code"></div>` : null}

        <div id="card-actions">
          <fluent-button @click="${() => this.delete(this.session.session)}" id="delete-button">
            Delete
          </fluent-button>

          <div>
            <fluent-button
              id="share-button"
              @click="${() => this.share(this.session)}"
              >Share</fluent-button
            >

            <!--<fast-button ?disabled="${this.codeGenerated}" id="qr-button" @click="${() => this.generateCode()}">
              QR Code
            </fast-button>-->

            <fluent-anchor appearance="accent" href="${`/${this.session.session}`}"
              >Resume</fluent-anchor
            >
          </div>
        </div>
      </fluent-card>
    `;
  }
}
