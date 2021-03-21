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
  @internalProperty() savedSessions: Array<string> | undefined;

  static get styles() {
    return css`
      :host {
        display: block;
        background-color: white;
        padding-top: 2em;

        color: black;
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

  render() {
    return html`
      <div>
        <h2>Welcome!</h2>

        ${
          this.savedSessions ? 
            this.savedSessions.map((session) => {
              return html`
              <fast-card>
                <h3>Card title</h3>
                <p>At purus lectus quis habitant commodo, cras. Aliquam malesuada velit a tortor. Felis orci tellus netus risus et ultricies augue aliquet.</p>
                <fast-anchor href="${`/${session}`}"></fast-anchor>
            </fast-card>
              `
            })
           : null
        }

        <fast-button @click="${() => this.newLive()}">New Session</fast-button>
      </div>
    `;
  }
}
