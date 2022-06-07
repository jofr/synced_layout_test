import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, queryAssignedElements } from "lit/decorators";

@customElement("tabbed-area")
export class TabbedArea extends LitElement {
    @queryAssignedElements()
    _contentElements!: Array<HTMLElement>;

    @property({ reflect: true })
    activeTab: number | null = null;

    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
        }

        div.tab-bar {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            background-color: var(--ui-lower-surface, #171717);
        }

        div.tab-bar > div {
            width: 2.0rem;
            height: 2.0rem;
            border-radius: 5px 0px 0px 5px;
        }

        div.tab-bar > div.active {
            background-color: var(--ui-higher-surface, #2c2c2c);
        }

        div.tab-bar > div > i {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 2.0rem;
            width: 2.0rem;
            text-align: center;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            user-select: none;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }

        div.tab-content {
            flex-grow: 1;
            overflow: hidden auto;
        }
    `;

    #activateTab(index: number) {
        for (const element of this._contentElements) {
            element.style.display = "none";
        }
        this._contentElements[index].style.display = "block";
        this.activeTab = index;
    }

    #handleSlotChange(): void {
        if (this._contentElements.length > 0 && this.activeTab === null) {
            this.#activateTab(0);
        } else if (this._contentElements.length === 0 && this.activeTab !== null) {
            this.activeTab = null;
        }
        this.requestUpdate();
    }

    #tabBarTemplate(): TemplateResult {
        return html`
            <div class="tab-bar">
                ${this._contentElements.map((element, index) => 
                    html`
                        <div class="${index === this.activeTab ? 'active' : ''}" @click=${() => this.#activateTab(index)}>
                            <i>${element.dataset.tabIcon}</i>
                        </div>
                    `
                )}
            </div>
        `
    }

    render() {
        return html`
            ${this.#tabBarTemplate()}
            <div class="tab-content">
                <slot @slotchange=${this.#handleSlotChange}></slot>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "tabbed-area": TabbedArea;
    }
}