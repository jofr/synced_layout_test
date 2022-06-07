import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { SceneGraphNode } from "../scene_graph/scene_graph";

const nodeConverter = {
    fromAttribute: (id: string) => window.layout.sceneGraph.getNode(id),
    toAttribute: (node: SceneGraphNode | null) => node === null ? "" : node.id 
}

@customElement("node-properties-editor")
export class NodePropertiesEditor extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: var(--ui-area-padding, 0.75rem);
        }

        div {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            user-select: none;
        }

        div input, div span:nth-child(2) {
            width: 7.5rem;
            margin-left: 0.75rem;
        }

        input {
            background-color: #535353;
            color: #ffffff;
            border: 1px solid var(--ui-surface);
            border-radius: 4px;
            text-align: center;
        }

        input:hover {
            background-color: #d9d9d922;
        }

        input:focus-visible {
            outline: 0px;
            background-color: var(--ui-surface);
        }
    `;

    @property({ converter: nodeConverter, reflect: true })
    node: SceneGraphNode;

    #onChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.node[input.dataset.property] = input.value;
    }

    #inputTemplate(property: string, value: any, inputType: "text" | "number" | "color"): TemplateResult {
        return html`
            <div>
                <span>${property}</span>
                <input @change=${this.#onChange} data-property="${property}" type="${inputType}" value="${value}">
            </input>
        `;
    }

    #inputType(property: string, value: any): "text" | "number" | "color" | null {
        if (["fill", "stroke"].includes(property)) {
            return "color";
        } else if (typeof(value) == "string") {
            return "text";
        } else if (typeof(value) == "number") {
            return "number";
        } else {
            return null;
        }
    }

    #ignoreProperty(property: string) {
        if (["parentNodeIds", "childNodeIds"].includes(property)) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        if (this.node) {
            const propertyTemplates = [];

            for (const key of Object.keys(this.node)) {
                if (this.#ignoreProperty(key)) {
                    continue;
                }

                const value = this.node[key];
                const inputType = this.#inputType(key, value);

                if (inputType !== null) {
                    propertyTemplates.push(this.#inputTemplate(key, value, inputType));
                } else {
                    propertyTemplates.push(html`<div><span>${key}</span><span>${this.node[key]}</span></div>`);
                }
            }
    
            return html`${propertyTemplates}`;
        } else {
            return html``;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "node-properties-editor": NodePropertiesEditor;
    }
}