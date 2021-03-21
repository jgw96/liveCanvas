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

@customElement("app-intro")
export class AppIntro extends LitElement {
  @internalProperty() savedSessions: Array<any> | undefined;

  static get styles() {
    return css`
      :host {
        display: block;
        background-color: white;
        padding-top: 2em;

        color: black;
      }

      h2 {
        font-size: 2.2em;
      }

      #recent-header {
        font-size: 1.2em;
        color: var(--app-color-primary);
      }

      fast-card {
        --background-color: #ffb0e0;
        padding-left: 12px;
        padding-right: 12px;
        padding-bottom: 12px;
        width: 20.9em;
        height: 9.4em;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      #saved-list {
        gap: 14px;
        display: flex;
        flex-wrap: wrap;
      }

      #new-button {
        width: 23.9em;
        height: 10.8em;
      }

      #new-button::part(control) {
        font-size: 1.6em;
      }

      #card-actions {
        display: flex;
        justify-content: flex-end;
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

      #session-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      @media (max-width: 600px) {
        fast-card {
          width: 100%;
        }

        #new-button {
          width: 100%;
        }
      }

      @media(screen-spanning: single-fold-vertical) {
        #saved-list {
          display: grid;
          grid-template-columns: 50% 50%;
          grid-gap: 30px;
        }

        fast-card {
          width: 94.4%;
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
    }
  }

  async newLive() {
    const room = randoRoom();
    console.log(room);

    if ((navigator as any).setAppBadge) {
      (navigator as any).setAppBadge();
    }

    if (room) {
      await saveSession(room);
      Router.go(`/${room}`);
    }
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
      <div>
        <h2>Welcome!</h2>

        ${this.savedSessions ? html`<h3 id="recent-header">Recent Sessions</h3>` : null}
        <div id="saved-list">
          ${this.savedSessions
            ? 
            this.savedSessions.map((session) => {
                return html`
                  <fast-card>
                    <div id="session-info">
                      <h3>${session.date}</h3>
                      <p>ID: ${session.session}</p>
                    </div>

                    <div id="card-actions">
                      <fast-button
                        id="share-button"
                        @click="${() => this.share(session)}"
                        >Share Session</fast-button
                      >
                      <fast-anchor href="${`/${session.session}`}"
                        >Resume Session</fast-anchor
                      >
                    </div>
                  </fast-card>
                `;
              })
            : null}

          <fast-button
            appearance="accent"
            id="new-button"
            @click="${() => this.newLive()}"
          >
            New Session
          </fast-button>
        </div>
      </div>
    `;
  }
}
