import { Router } from "@vaadin/router";
import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from "lit-element";
import { getSavedSessions, saveSession } from "../services/sessions";
import { randoRoom } from "../services/utils";

import "../components/session-item";

@customElement("app-intro")
export class AppIntro extends LitElement {
  @internalProperty() savedSessions: Array<any> | undefined = [];

  @internalProperty() sessionName: string | undefined;

  newRoom: string | undefined = undefined;

  static get styles() {
    return css`
      :host {
        display: block;;
        padding-top: 2em;

        padding: 16px;

        height: 96vh;
      }

      #welcomeBlock {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      h2 {
        font-size: 2.2em;
      }

      #recent-header {
        font-size: 1.4em;
      }

      #new-button {
        /* position: absolute;
        right: 16px;
        bottom: 16px;
        border-radius: 22px;
        padding-left: 6px;
        padding-right: 6px;
        background: var(--app-color-primary);
        width: 8em;*/
      }

      #intro-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      #intro-block h2 {
        font-size: 3em;
        margin-bottom: 0;
        margin-top: 1.2em;
      }

      #intro-block p {
        font-size: 1.4em;
        text-align: center;
        width: 46vw;
      }

      #screens {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #screens img {
        width: 48vw;
        box-shadow: 0 0 1.8rem rgb(0 0 0 / 15%);
        border-radius: 8px;
        margin-top: 2em;
      }

      @media (min-width: 1030px) {
        #saved-list {
          display: grid;
          grid-template-columns: auto auto auto;
          gap: 1%;
          max-width: 80vw;
        }
      }

      @media (min-width: 800px) and (max-width: 1030px) {
        #saved-list {
          display: grid;
          grid-template-columns: auto auto;
          gap: 1%;
        }
      }
    

      @media (max-width: 800px) {
        sl-card {
          width: 100%;
        }

        #intro-block p {
          width: 82vw;
        }

        #screens img {
          width: 80vw;
          margin-top: 2em;
        }

        #welcomeBlock {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1;
          display: flex;
          /* align-items: unset; */
        }

        #new-button {
          border-radius: 0;
          width: 100%;
          --sl-input-border-radius-medium: 0;
        }

        #welcomeBlock h2 {
          display: none;
        }

        #glass {
          padding-bottom: 3em;
        }

        #recent-header {
          margin-top: 0;
        }
      }

      @media (horizontal-viewport-segments: 2) {
        #saved-list {
          display: grid;
          max-width: 100%;
          grid-template-columns: auto auto;
          grid-column-gap: calc(env(viewport-segment-left 1 0) - env(viewport-segment-right 0 0) + 10px);
          grid-row-gap: 10px;
        }

        sl-card {
          width: 100%;
        }

        #intro-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 54px;
        }

        #screens img {
          width: 91%;
        }
      }

      #glass {
        
      }

      @media(horizontal-viewport-segments: 2) {
        sl-dialog::part(panel) {
          right: 21px;
          left: initial;
          position: fixed;
        }
      }

      @media (screen-spanning: single-fold-horizontal) {
        #saved-list {
          gap: 12px;
        }

        #intro-container {
          height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const sessionsData = await getSavedSessions();

    if (sessionsData) {
      this.savedSessions = sessionsData;
      console.log("savedSessions", sessionsData);
    } else {
      this.savedSessions = undefined;
    }
  }

  async newLive() {
    const room = randoRoom();
    this.newRoom = room;

    const dialog = this.shadowRoot?.querySelector("#newSessionDialog");
    (dialog as any).show();
  }

  async startNewSession() {
    if ((navigator as any).setAppBadge) {
      (navigator as any).setAppBadge();
    }

    if (this.newRoom) {
      await saveSession({
        id: this.newRoom,
        name: this.sessionName,
      });
      Router.go(`/${this.newRoom}`);
    }

    if (this.newRoom) {
      console.log("room", this.newRoom);
      Router.go(`/${this.newRoom}`);
    }
  }

  handleSessionName() {
    const name = (this.shadowRoot?.querySelector("#sessionNameInput") as any)?.value;
    console.log(name);
    this.sessionName = name;
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

  handleDelete(ev: CustomEvent) {
    const newSessions = ev.detail.sessions;

    if (newSessions) {
      this.savedSessions = newSessions;
    }
  }

  render() {
    return html`
      <sl-dialog
        id="newSessionDialog"
        label="New Session"
        class="dialog-overview"
      >
        Name your session:

        <sl-input id="sessionNameInput" @sl-change="${() => this.handleSessionName()}" placeholder="Planning"></sl-input>

        <sl-button slot="footer">Close</sl-button>
        <sl-button slot="footer" variant="primary" @click="${() => this.startNewSession()}">Start</sl-button>
      </sl-dialog>

      <div id="glass">
        <div>
          ${this.savedSessions
            ? html`<div id="welcomeBlock">
                <h2>Welcome!</h2>

                <sl-button
                  variant="primary"
                  id="new-button"
                  @click="${() => this.newLive()}"
                >
                  New Session
                </sl-button>
              </div>`
            : html`
                <div id="intro-container">
                  <div id="intro-block">
                    <h2>Welcome!</h2>
                    <p>
                      LiveCanvas is an open source collaborative drawing app
                      offering a simple and fast user experience. LiveCanvas can
                      be used with anyone, simply share a link and you are ready
                      to go! Tap "New Session" to get started!
                    </p>

                    <sl-button
                      variant="primary"
                      id="new-button"
                      @click="${() => this.newLive()}"
                    >
                      New Session
                    </sl-button>
                  </div>

                  <div id="screens">
                    <img
                      src="/assets/screenshots/screen.webp"
                      alt="screenshot of app"
                    />
                  </div>
                </div>
              `}
          ${this.savedSessions
            ? html`<h3 id="recent-header">Recent Sessions</h3>`
            : null}
          <div id="saved-list">
            ${this.savedSessions
              ? this.savedSessions.map((session) => {
                  return html`
                    <session-item
                      @deleted="${(ev: CustomEvent) => this.handleDelete(ev)}"
                      .session="${session}"
                    ></session-item>
                  `;
                })
              : null}
          </div>
        </div>
      </div>
    `;
  }
}
