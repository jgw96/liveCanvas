import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getAccount } from "../services/auth";
import { getContacts } from "../services/graph-api";

@customElement("app-contacts")
export class AppContacts extends LitElement {
  @state() graphContacts: any[] | null = null;

  static get styles() {
    return css`
      .contactInfo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 75%;
      }

      .contactInfo sl-skeleton {
        margin-top: 10px;
      }

      .contactInfo .displayName {
        font-weight: bold;
        color: white;
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

      ul {
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: auto;
        height: 52vh;
      }

      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      ul::-webkit-scrollbar {
        width: 8px;
        background: #222222;
        border-radius: 4px;
      }

      @media (prefers-color-scheme: light) {
        ul::-webkit-scrollbar {
          background: #ffffff;
        }
      }

      #contactsList sl-menu-item {
        margin-top: 10px;
        background: transparent;
      }

      #contactsList sl-menu-item::part(content) {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #contactsList ul sl-button {
        height: 2em;
        border: solid 1px var(--app-color-primary);
        margin-bottom: 6px;
        background: var(--app-color-primary);
      }

      #contactsButton {
        position: fixed;
        bottom: 16px;
        right: 16px;
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

      @media (max-width: 545px) {
        #contactsButton {
          top: initial;
          bottom: 6px;
          right: 105px;
          left: initial;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async selectContacts() {
    await (this.shadowRoot?.querySelector("#contactsDialog") as any)?.show();

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

  async handleResults(contacts: any[]) {
    await (this.shadowRoot?.querySelector("#contactsDialog") as any)?.hide();

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
    (this.shadowRoot?.querySelector("#contactsDialog") as any)?.hide();
  }

  render() {
    return html`
      <sl-button id="contactsButton" @click="${() => this.selectContacts()}">
        Invite
      </sl-button>

      <sl-dialog
        id="contactsDialog"
        label="Invite Frequent Contacts"
        class="dialog-overview"
      >
        <ul>
          ${this.graphContacts
            ? this.graphContacts.map((contact) => {
                return html`
                  <li>
                    <div class="contactInfo">
                      <span class="displayName">${contact.displayName}</span>
                      <span class="displayEmail"
                        >Address: ${contact.emailAddresses[0].address}</span
                      >
                    </div>
                    <sl-button @click="${() => this.handleResults([contact])}"
                      >Select</sl-button
                    >
                  </li>
                `;
              })
            : html`
                <li>
                  <div class="contactInfo">
                    <sl-skeleton></sl-skeleton>
                    <sl-skeleton></sl-skeleton>
                  </div>
                </li>

                <li>
                  <div class="contactInfo">
                    <sl-skeleton></sl-skeleton>
                    <sl-skeleton></sl-skeleton>
                  </div>
                </li>

                <li>
                  <div class="contactInfo">
                    <sl-skeleton></sl-skeleton>
                    <sl-skeleton></sl-skeleton>
                  </div>
                </li>

                <li>
                  <div class="contactInfo">
                    <sl-skeleton></sl-skeleton>
                    <sl-skeleton></sl-skeleton>
                  </div>
                </li>
              `}
        </ul>

        <sl-button slot="footer" @click="${() => this.close()}"
          >Cancel</sl-button
        >
      </sl-dialog>
    `;
  }
}
