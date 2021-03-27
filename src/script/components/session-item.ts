import { LitElement, css, html, customElement, property } from "lit-element";

@customElement("session-item")
export class SessionItem extends LitElement {
  @property({ type: Object }) session: any = null;

  static get styles() {
    return css`
      :host {
        width: 20em;
      }

      fast-card {
        --background-color: #ffb0e0;
        padding-left: 12px;
        padding-right: 12px;
        padding-bottom: 12px;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
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
        justify-content: center;
      }

      #card-actions fast-anchor {
        background-color: var(--app-color-primary);
        border-radius: 22px;

        padding-left: 6px;
        padding-right: 6px;
      }

      #share-button {
        margin-right: 8px;
        border-radius: 22px;

        padding-left: 6px;
        padding-right: 6px;
      }

      #code {
        margin-bottom: 2em;
        margin-top: 10px;
        display: flex;
        justify-content: end;
        align-items: center;
        justify-content: center;
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
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    new (window as any).QRCode(this.shadowRoot?.querySelector("#code"), {
      text: `/${this.session.session}`,
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

  render() {
    return html`
      <fast-card>
        <div id="session-info">
          <h3>${this.session.date}</h3>
          <p>ID: ${this.session.session}</p>
        </div>

        <div id="code"></div>

        <div id="card-actions">
          <fast-button
            id="share-button"
            @click="${() => this.share(this.session)}"
            >Share Session</fast-button
          >
          <fast-anchor href="${`/${this.session.session}`}"
            >Resume Session</fast-anchor
          >
        </div>
      </fast-card>
    `;
  }
}
