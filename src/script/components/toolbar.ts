import { LitElement, css, html, customElement, property } from 'lit-element';


@customElement('app-toolbar')
export class AppToolbar extends LitElement {

  @property({ type: String }) activeMode: string = 'pen';

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
        width: 14em;
        display: flex;
        justify-content: space-between;
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
        <button id="redButton" @click="${() => this.pickColor('red')}"></button>
        <button id="blueButton" @click="${() => this.pickColor('blue')}"></button>
        <button id="yellowButton" @click="${() => this.pickColor('yellow')}"></button>
        <button id="greenButton" @click="${() => this.pickColor('green')}"></button>
        <button id="blackButton" @click="${() => this.pickColor('black')}"></button>

        <button id="clearButton" @click="${() => this.clear()}"><img src="/assets/trash.svg"></button>

        ${this.activeMode === 'pen' ? html`<button id="eraserButton" @click="${() => this.penMode('erase')}"><img src="/assets/erase.svg"></button>` : html`<button id="penButton" @click="${() => this.penMode('pen')}"><img src="/assets/brush.svg"></button>`}
      </div>
    `;
  }
}