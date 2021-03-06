import { LitElement, css, html, customElement, property, internalProperty } from 'lit-element';

import { set } from 'idb-keyval';

@customElement('app-header')
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
        background: white;
        box-shadow: #00000033 -2px 1px 14px 0px;
        right: 0;
        bottom: 0;
        width: 15em;
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

      @media(max-width: 800px) {

      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    const pwaAuth = this.shadowRoot?.querySelector('pwa-auth');
    pwaAuth?.addEventListener("signin-completed", async (e: any) => {
      console.log(e.detail)
      localStorage.setItem('user', JSON.stringify(e.detail));
      this.userData = e.detail;

      await set('userData', this.userData);
    })
  }

  async settings() {
    let initialSetting = this.openSettings;

    if (initialSetting === false) {
      console.log('here');
      this.openSettings = true;

      await this.updateComplete;

      this.ani = this.shadowRoot?.querySelector("#settings")?.animate([
        {
          transform: "translateX(200px)",
          opacity: 0
        },
        {
          transform: "translateX(0px)",
          opacity: 1,
        }
      ], {
        duration: 280,
        fill: "forwards"
      });

      console.log(this.ani);
    }
    else {
      console.log('here reverse', this.ani);
      this.ani?.reverse();

      if (this.ani) {
        this.ani.onfinish = () => {
          this.openSettings = false;
        }
      }

    }

  }

  render() {
    return html`
      <header>
        <h1>Live Canvas</h1>

        <div id="settingsBlock">
        <fast-button @click="${() => this.settings()}" appearance="lightweight" id="settingsButton"><img src="/assets/settings-outline.svg" alt="settings icon"></fast-button>

        ${!this.userData ? html`<pwa-auth menuPlacement="end" appearance="button" microsoftkey="22410c67-5ee5-4a61-84a9-9a98af98d036"></pwa-auth>` :
          html`
            <div id="avatar">
              <p>${this.userData.name}</p>
            </div>
          `
        }
        </div>

        ${this.openSettings ? html`<div id="settings">
          <div id="settingsHeader">
            <fast-button @click="${() => this.settings()}">Close</fast-button>
          </div>
        </div>` : null}
        </div>
      </header>
    `;
  }
}