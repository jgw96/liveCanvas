import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from "lit-element";
import { getAccount } from "../services/auth";
import { getContacts } from "../services/graph-api";

@customElement("app-contacts")
export class AppContacts extends LitElement {
  @internalProperty() graphContacts: any[] | null = null;

  static get styles() {
    return css`
      .contactInfo {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .contactInfo .displayName {
        font-weight: bold;
        color: black;
      }
      .contactInfo .displayEmail {
        color: #6d6d6d;
      }
      #contactsHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1em;
      }
      #contactsHeader h3 {
        font-size: 1.5em;
        margin-top: 0;
        margin-bottom: 0;
      }
      #contactsBlock {
        background: rgb(213 213 213 / 67%);
        backdrop-filter: blur(10px);
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        animation-name: fadeIn;
        animation-duration: 280ms;
      }
      #contactsList {
        background: white;
        color: black;
        position: absolute;
        top: 8em;
        z-index: 9999;
        bottom: 8em;
        left: 8em;
        right: 8em;
        border-radius: 4px;
        padding: 1em 2em;
        overflow: hidden;
      }
      #contactsList ul {
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: auto;
        max-height: 52vh;
      }
      #contactsList ul::-webkit-scrollbar {
        width: 8px;
        background: #222222;
        border-radius: 4px;
      }
      @media (prefers-color-scheme: light) {
        #contactsList ul::-webkit-scrollbar {
          background: #ffffff;
        }
      }
      #contactsList fluent-menu-item {
        margin-top: 10px;
        background: transparent;
      }
      #contactsList fluent-menu-item::part(content) {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      #contactsList ul fluent-button {
        height: 2em;
        border: solid 1px var(--app-color-primary);
        margin-bottom: 6px;
        background: var(--app-color-primary);
      }
      #contactsButton {
        position: fixed;
        bottom: 16px;
        right: 16px;
        color: white;
        border: none;
        font-size: 16px;
        border-radius: 50%;
        width: 48px;
        height: 48px;
      }

      #contactsButton img {
        color: white;
      }

      #contactsButton img, #contactsHeader img {
        width: 18px;
      }

      @media (prefers-color-scheme: light) {
        #contactsBlock {
          background: #ffffff4d;
        }
        #contactsList {
          background: #f5f5f5;
        }
        ##contactsBlock fast-switch::part(label) {
          color: black;
        }
        .contactInfo .displayName {
          color: black;
        }
      }

      #closeButton {
        background: silver;
      }

      @keyframes fadeIn {
        from {
          opacity: 0.2;
        }

        to {
          opacity: 1;
        }
      }

      @media(max-width: 420px) {
        #contactsButton {
          bottom: 4.4em;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async selectContacts() {
    const supported = "contacts" in navigator && "ContactsManager" in window;

    const account = getAccount();

    if (supported) {
      const props = ["name", "email"];
      const opts = { multiple: false };

      try {
        const contacts = await (navigator as any).contacts.select(props, opts);
        this.handleResults(contacts);
      } catch (err) {
        // Handle any errors here.

        console.error(err);
      }
    } else if (account) {
      this.graphContacts = await getContacts();
    } else {
      await (navigator as any).share({
        url: location.href,
        text: "Join me on my board",
        title: "Live Canvas",
      });
    }
  }

  handleResults(contacts: any[]) {
    let addresses: any[] = [];

    contacts.forEach((contact) => {
      if (
        (contact.email && contact.email[0]) ||
        (contact.emailAddresses && contact.emailAddresses[0].address)
      ) {
        if (contact.email && contact.email[0]) {
          addresses.push(contact.email[0]);
        } else {
          addresses.push(contact.emailAddresses[0].address);
        }
      }
    });

    let event = new CustomEvent("got-contacts", {
      detail: {
        data: addresses,
      },
    });
    this.dispatchEvent(event);

    if (this.graphContacts) {
      this.graphContacts = null;
    }
  }

  close() {
    this.graphContacts = null;
  }

  render() {
    return html`
      <fluent-button id="contactsButton" appearance="accent" @click="${() => this.selectContacts()}">
        <img src="/assets/share.svg" alt="share icon">
      </fluent-button>
      ${this.graphContacts
        ? html`<div id="contactsBlock">
            <div id="contactsList">
              <div id="contactsHeader">
                <h3>Frequent Contacts</h3>
                <fluent-button id="closeButton" appearance="lightweight" @click="${() => this.close()}">
                  <img src="/assets/close.svg" alt="close icon">
                </fluent-button>
              </div>
              <ul>
                ${this.graphContacts.map((contact) => {
                  return html`
                    <fluent-menu-item>
                      <div class="contactInfo">
                        <span class="displayName">${contact.displayName}</span>
                        <span class="displayEmail"
                          >Address: ${contact.emailAddresses[0].address}</span
                        >
                      </div>
                      <fluent-button
                        @click="${() => this.handleResults([contact])}"
                        >Select</fluent-button
                      >
                    </fluent-menu-item>
                  `;
                })}
              </ul>
            </div>
          </div>`
        : null}
    `;
  }
}
