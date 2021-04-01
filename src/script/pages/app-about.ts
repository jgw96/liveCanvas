import { LitElement, css, html, customElement } from 'lit-element';


@customElement('app-about')
export class AppAbout extends LitElement {

  static get styles() {
    return css`
      :host {
        padding: 16px;
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <h2>About Page</h2>
      </div>
    `;
  }
}