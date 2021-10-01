import { LitElement, css, html, customElement, property } from 'lit-element';
import { getDevices } from '../services/graph-api';


@customElement('app-toolbar')
export class AppToolbar extends LitElement {

  @property({ type: String }) activeMode: string = 'pen';
  @property({ type: Boolean }) showModeToast: boolean = false;
  @property({ type: Boolean }) confirmDelete: boolean = false;

  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        bottom: 16px;
        left: 16px;
        background: white;
        padding: 8px;
        border-radius: 22px;
        box-shadow: 0 0 10px 4px #686bd261;

        animation-name: fadein;
        animation-duration: 280ms;
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

      #penButton, #eraserButton, #clearButton, #saveButton, #presentButton {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
      }

      #penButton img, #eraserButton img, #clearButton img, #saveButton img, #presentButton img {
        height: 18px;
        width: 18px;
      }

      #innerBlock {
        display: flex;
        justify-content: space-between;
        width: 18em;
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

      #endPromptContainer {
        z-index: 99999;
        position: fixed;
        inset: 0px;
        background: rgb(169 169 169 / 59%);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 8em;
        animation-name: fadein;
        animation-duration: 300ms;
      }

      
      #endPrompt {
        background: white;
        width: 20em;
        height: 9em;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        padding: 8px;
        padding-top: 0px;

        box-shadow: #00000024 0px 1px 8px 3px;
      }

      #endPrompt h2 {
        color: black;
        margin-top: 12px;
        margin-left: 6px;
        font-size: 22px;
      }

      #endPromptActions {
        display: flex;
        justify-content: flex-end;
        padding: 16px;
        padding-bottom: 0;
        padding-right: 0;
      }

      #endPromptActions fluent-button {
        width: 5em;
      }

      #end-button {
        margin-left: 6px;
      }

      #noButton {
        color: red;
        background: none;
        border: none;
        font-weight: bold;
        width: 3em;
        height: 2em;
        font-size: 16px;

        background: #d3d3d3bf;
        border-radius: 18px;
        width: 4em;
        margin-right: 8px;
      }

      #endConfirm {
        color: var(--app-color-primary);
        background: none;
        border: none;
        font-weight: bold;
        width: 3em;
        height: 2em;
        font-size: 16px;

        background: #d3d3d3bf;
        border-radius: 18px;
        width: 4em;
      }

      @media(min-width: 800px) {
        #modeToast {
          right: 40%;
          left: 40%;
        }

        #innerBlock {
          flex-direction: column;
          min-height: 19em;
          width: 2em;
          padding-top: 8px;
          padding-bottom: 8px;
          justify-content: space-between;
          align-items: center;
        }
      }

      @media(max-width: 420px) {
        :host {
          right: 16px;

          padding-left: 16px;
          padding-right: 16px;
        }

        #innerBlock {
          width: 100%;
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
    this.confirmDelete = false;

    let event = new CustomEvent('clear-picked', {
      detail: {
        
      }
    });
    this.dispatchEvent(event);
  }

  clearPrompt() {
    this.confirmDelete = !this.confirmDelete;
  }

  save() {
    let event = new CustomEvent('save-picked', {
      detail: {}
    })
    this.dispatchEvent(event);
  }

  present() {
    let event = new CustomEvent('present-picked', {
      detail:{}
    });
    this.dispatchEvent(event);
  }
  
  async shareToDevice() {
    const devices = await getDevices();
    console.log(devices);
  }

  render() {
    return html`
      <div id="innerBlock">
        <button id="redButton" aria-label="red color" @click="${() => this.pickColor('red')}"></button>
        <button id="blueButton" aria-label="blue color" @click="${() => this.pickColor('blue')}"></button>
        <button id="yellowButton" aria-label="yellow color" @click="${() => this.pickColor('yellow')}"></button>
        <button id="greenButton" aria-label="green color" @click="${() => this.pickColor('green')}"></button>
        <button id="blackButton" aria-label="black color" @click="${() => this.pickColor('black')}"></button>

        <button id="clearButton" @click="${() => this.clearPrompt()}"><img src="/assets/trash.svg" alt="trash icon"></button>
        <button id="saveButton" @click="${() => this.save()}"><img src="/assets/save-outline.svg" alt="save icon"></button>
        <!--<button id="presentButton" @click="${() => this.present()}"><img src="/assets/tv-outline.svg" alt="present icon"></button>-->
        <!--<button id="devicesButton" @click="${() => this.shareToDevice()}">Device</button>-->

        ${this.showModeToast ? html`<div id="modeToast">${this.activeMode} mode</div>` : null}

        ${this.confirmDelete === true ? html`
        <div id="endPromptContainer">
              <div id="endPrompt">
                <h2>Clear Canvas?</h2>

                <div id="endPromptActions">
                  <fluent-button @click="${() => this.clearPrompt()}">No</fluent-button>
                  <fluent-button
                    id="end-button"
                    appearance="accent"
                    @click="${() => this.clear()}"
                    >Clear</fluent-button
                  >
                </div>
              </div>
            </div>
        ` : null}

        ${this.activeMode === 'pen' ? html`<button id="eraserButton" @click="${() => this.penMode('erase')}"><img src="/assets/erase.svg" alt="erase icon"></button>` : html`<button id="penButton" @click="${() => this.penMode('pen')}"><img src="/assets/brush.svg" alt="brush icon"></button>`}
      </div>
    `;
  }
}