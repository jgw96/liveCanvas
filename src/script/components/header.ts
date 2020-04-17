import { LitElement, css, html, customElement, property } from 'lit-element';

import { set } from 'idb-keyval';

@customElement('app-header')
export class AppHeader extends LitElement {

  @property({ type: Object }) userData: any = null;

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
        font-weight: normal;
      }

      pwa-auth {
        position: absolute;
        top: 14px;
        right: 16px;
        z-index: 9999;
      }

      pwa-auth::part(signInButton) {
        background: none;
        color: var(--app-color-primary);
        border: solid 2px var(--app-color-primary); 
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
        border: solid 2px var(--app-color-primary);
        border-radius: 22px;
        padding-left: 8px;
        padding-right: 8px;
      }

      #avatar p {
        margin: 6px;
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

  render() {
    return html`
      <header>
        <h1>Live Canvas</h1>

        ${!this.userData ? html`<pwa-auth menuPlacement="end" appearance="button" microsoftkey="22410c67-5ee5-4a61-84a9-9a98af98d036"></pwa-auth>` :
          html`
            <div id="avatar">
              <p>${this.userData.name}</p>
            </div>
          `
        }
      </header>
    `;
  }
}