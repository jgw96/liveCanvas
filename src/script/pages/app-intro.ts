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

import '../components/session-item';

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
        font-size: 1.4em;
        color: var(--app-color-primary);
      }

      #saved-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      #new-button {
        position: fixed;
        right: 16px;
        bottom: 16px;
        border-radius: 22px;
        padding-left: 6px;
        padding-right: 6px;
        background: var(--app-color-primary);
        width: 8em;
      }

      @media (max-width: 600px) {
        fast-card {
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

    (CSS as any).paintWorklet.addModule("https://unpkg.com/css-houdini-circles@1.0.5/dist/circles.js");
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

  handleDelete(ev: CustomEvent) {
    const newSessions = ev.detail.sessions;

    if (newSessions) {
      this.savedSessions = newSessions;
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
                  <session-item @deleted="${(ev: CustomEvent) => this.handleDelete(ev)}" .session="${session}"></session-item>
                `;
              })
            : null}
        </div>

        <fast-button
            appearance="accent"
            id="new-button"
            @click="${() => this.newLive()}"
          >
            New Session
          </fast-button>
      </div>
    `;
  }
}
