import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


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