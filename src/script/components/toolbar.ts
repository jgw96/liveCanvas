import { LitElement, css, html, customElement, property } from 'lit-element';


@customElement('app-toolbar')
export class AppToolbar extends LitElement {

  @property({ type: String }) activeMode: string = 'pen';
  @property({ type: Boolean }) showModeToast: boolean = false;
  @property({ type: Boolean }) confirmDelete: boolean = false;

  static get styles() {
    return css`
      :host {
        position: fixed;
        bottom: 16px;
        left: 16px;
        background: white;
        padding: 8px;
        border-radius: 22px;
        padding-left: 18px;
        padding-right: 18px;
        box-shadow: 0 0 10px 4px #686bd261;

        animation-name: fadein;
        animation-duration: 200ms;
      }

      button {
        height: 28px;
        border-radius: 50%;
        width: 28px;
        border: solid 2px black;
        cursor: pointer;
      }

      #penButton img {
        height: 22px;
        width: 22px;
      }

      #redButton {
        background: red;
      }

      #blueButton {
        background: blue;
      }

      #yellowButton {
        background: yellow;
      }

      #greenButton {
        background: green;
      }

      #blackButton {
        background: black;
      }

      #penButton, #eraserButton, #clearButton {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
      }

      #penButton img, #eraserButton img, #clearButton img {
        height: 18px;
        width: 18px;
      }

      #innerBlock {
        width: 16em;
        display: flex;
        justify-content: space-between;
      }

      #modeToast {
        position: fixed;
        bottom: 14px;
        right: 20%;
        left: 20%;
        background: var(--app-color-primary);
        color: white;
        padding: 12px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: rgba(104, 107, 210, 0.38) 0px 0px 10px 4px;

        animation-name: fadein;
        animation-duration: 200ms;
      }

      @media(min-width: 800px) {
        #modeToast {
          right: 40%;
          left: 40%;
        }
      }

      @keyframes fadein {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  pickColor(color: string) {
    console.log(color);

    let event = new CustomEvent('color-picked', {
      detail: {
        color
      }
    });
    this.dispatchEvent(event);
  }

  penMode(mode: string) {
    console.log('mode', mode);
    let event = new CustomEvent('mode-picked', {
      detail: {
        mode
      }
    });
    this.dispatchEvent(event);

    this.activeMode = mode;

    // show toast
    this.showModeToast = true;

    setTimeout(() => {
      this.showModeToast = false;
    }, 2000);
  }

  clear() {
    let event = new CustomEvent('clear-picked', {
      detail: {
        
      }
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div id="innerBlock">
        <button id="redButton" aria-label="red color" @click="${() => this.pickColor('red')}"></button>
        <button id="blueButton" aria-label="blue color" @click="${() => this.pickColor('blue')}"></button>
        <button id="yellowButton" aria-label="yellow color" @click="${() => this.pickColor('yellow')}"></button>
        <button id="greenButton" aria-label="green color" @click="${() => this.pickColor('green')}"></button>
        <button id="blackButton" aria-label="black color" @click="${() => this.pickColor('black')}"></button>

        <button id="clearButton" @click="${() => this.clear()}"><img src="/assets/trash.svg" alt="trash icon"></button>

        ${this.showModeToast ? html`<div id="modeToast">${this.activeMode} mode</div>` : null}

        ${this.confirmDelete ? html`` : null}

        ${this.activeMode === 'pen' ? html`<button id="eraserButton" @click="${() => this.penMode('erase')}"><img src="/assets/erase.svg" alt="erase icon"></button>` : html`<button id="penButton" @click="${() => this.penMode('pen')}"><img src="/assets/brush.svg" alt="brush icon"></button>`}
      </div>
    `;
  }
}