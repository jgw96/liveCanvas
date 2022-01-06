import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from "lit-element";

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
        height: 3.6em;
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
        backdrop-filter: blur(20px);
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

      #loginButton,
      #logoutButton {
        display: none;
        align-items: center;
        padding-left: 6px;
        padding-right: 6px;

        color: black;
      }

      @media (max-width: 800px) {
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    (window as any).requestIdleCallback(async () => {
      const module = await import("../services/auth");
      const account = await module.getAccount();
      if (account) {
        this.userData = account;

        const module = await import('idb-keyval');

        await module.set("userData", account);
      } else {
        // delay and try again
        setTimeout(async () => {
          const account = await module.getAccount();
          console.log(account);
          if (account) {
            this.userData = account;

            const module = await import('idb-keyval');

            await module.set("userData", account);
          }
        }, 2000);
      }
    }, {
      timeout: 800
    });
  }

  async login() {
    const module = await import("../services/auth");

    await module.login();
    const account = await module.getAccount();
    console.log(account);

    this.userData = account;

    const idb = await import('idb-keyval');
    await idb.set("userData", account);
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
          easing: "ease-in-out",
        }
      );

      console.log(this.ani);
    } else {
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
      const module = await import("../services/auth");

      await module.logout();

      const idb = await import('idb-keyval');
      await idb.clear();

      this.userData = null;
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return html`
      <header>
        <h1>LiveCanvas</h1>

        <div id="settingsBlock">
        <!--<fast-button @click="${() =>
          this.settings()}" appearance="lightweight" id="settingsButton"><img src="/assets/settings-outline.svg" alt="settings icon"></fast-button>-->

        ${
          !this.userData
            ? html`<sl-button
                id="loginButton"
                appearance="outline"
                @click="${() => this.login()}"
                >Login</sl-button
              >`
            : html`
                <sl-button
                  id="logoutButton"
                  @click="${() => this.handleLogout()}"
                  id="avatar"
                >
                  <p>Logout</p>
                </sl-button>
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
