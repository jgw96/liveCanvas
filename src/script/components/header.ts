import { clear, set } from "idb-keyval";

import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from "lit-element";


import { getAccount, login, logout } from "../services/auth";

@customElement("app-header")
export class AppHeader extends LitElement {
  @property({ type: Object }) userData: any = null;

  @internalProperty() openSettings: boolean = false;

  ani: Animation | undefined;

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 16px;
        padding-right: 16px;
        color: var(--app-color-primary);
        height: 3.6em;
        background: white;

        position: fixed;
        left: 0;
        right: 0;
        z-index: 99999;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 18px;
        font-weight: bold;
      }

      pwa-auth::part(signInButton) {
        background: none;
        color: black;
        border: solid 2px black;
        border-radius: 2px;
        padding-top: 4px;
        padding-bottom: 4px;
        padding-left: 14px;
        padding-right: 14px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 22px;
      }

      pwa-auth::part(googleButton) {
        display: none;
      }

      pwa-auth::part(facebookButton) {
        display: none;
      }

      #avatar {
        border: solid 2px black;
        border-radius: 22px;
        padding-left: 8px;
        padding-right: 8px;
      }

      #avatar p {
        margin: 6px;
      }

      #settings {
        position: fixed;
        background: #ffffff9e;
        backdrop-filter: blur(10px);
        box-shadow: rgb(0 0 0 / 20%) -2px 1px 14px 0px;
        right: 0px;
        bottom: 0px;
        height: 100%;
      }

      #settingsBlock {
        display: flex;
        align-items: center;
      }

      #settingsButton {
        margin-right: 8px;
      }

      #settingsButton img {
        height: 29px;
        margin-top: 4px;
      }

      #settingsHeader {
        padding: 8px;
      }

      .settings-item {
        height: 15em;
        padding-left: 10px;
        padding-right: 10px;
        margin: 10px;
        width: 16em;

        background: var(--app-color-primary);
        color: white;
      }

      .settings-item fast-anchor {
        border-radius: 22px;
        padding-left: 6px;
        padding-right: 6px;
      }

      #loginButton, #logoutButton {
        display: flex;
        align-items: center;
        padding-left: 6px;
        padding-right: 6px;
        border-radius: 22px;
        width: 5em;
      }

      @media (max-width: 800px) {
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const account = await getAccount();
    console.log(account);
    if (account) {
      this.userData = account;

      await set('userData', account);
    }
    else {
      // delay and try again
      setTimeout(async () => {
        const account = await getAccount();
        console.log(account);
        if (account) {
          this.userData = account;

          await set('userData', account);
        }
      }, 2000);
    }
  }

  async login() {
    await login();
    const account = await getAccount();
    console.log(account);

    this.userData = account;

    await set('userData', account);
  }

  async settings() {
    let initialSetting = this.openSettings;

    if (initialSetting === false) {
      console.log("here");
      this.openSettings = true;

      await this.updateComplete;

      this.ani = this.shadowRoot?.querySelector("#settings")?.animate(
        [
          {
            transform: "translateX(200px)",
            opacity: 0,
          },
          {
            transform: "translateX(0px)",
            opacity: 1,
          },
        ],
        {
          duration: 280,
          fill: "forwards",
        }
      );

      console.log(this.ani);
    } else {
      console.log("here reverse", this.ani);
      this.ani?.reverse();

      if (this.ani) {
        this.ani.onfinish = () => {
          this.openSettings = false;
        };
      }
    }
  }

  async handleLogout() {
    try {
      await logout();
      await clear();

      this.userData = null;
    }
    catch (err) {
      console.error(err);
    }
  }

  render() {
    return html`
      <header>
        <h1>LiveCanvas</h1>

        <div id="settingsBlock">
        <fast-button @click="${() =>
          this.settings()}" appearance="lightweight" id="settingsButton"><img src="/assets/settings-outline.svg" alt="settings icon"></fast-button>

        ${
          !this.userData
            ? html`<fast-button id="loginButton" appearance="accent" @click="${() => this.login()}">Login</fast-button>`
            : html`
                <fast-button id="logoutButton" @click="${() => this.handleLogout()}" id="avatar">
                  <p>Logout</p>
                </fast-button>
              `
        }
        </div>

        ${
          this.openSettings
            ? html`<div id="settings">
                <div id="settingsHeader">
                  <fast-button @click="${() => this.settings()}"
                    >Close</fast-button
                  >
                </div>

                <fast-card class="settings-item">
                  <h3>About</h3>
                  <p>
                    LiveCanvas is an open source collaborative drawing app
                    offering a simple and fast user experience. LiveCanvas can
                    be used with anyone, simply share a link and you are ready
                    to go!
                  </p>

                  <fast-anchor
                    href="https://github.com/jgw96/liveCanvas"
                    apperance="button"
                    >Github</fast-anchor
                  >
                </fast-card>
              </div>`
            : null
        }
        </div>
      </header>
    `;
  }
}
