import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

// import './app-home';
import './app-intro';

import { Router } from '@vaadin/router';

import '../components/header';


@customElement('app-index')
export class AppIndex extends LitElement {

  static get styles() {
    return css`
      main {
        
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
    router.setRoutes([
      { path: '/', component: 'app-intro' },
      {
        path: '/:room', 
        component: 'app-home',
        action: async() => {
          await import('./app-home.js');
        },
      },
      {
        path: "/about",
        component: "app-about",
        action: async() => {
          await import('./app-about.js');
        },
      }
    ]);
  }

  render() {
    return html`
      <div>
        <app-header></app-header>

        <main>
          <div id="routerOutlet"></div>
        </main>
      </div>
    `;
  }
}