import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { SceneGraphNode } from "../scene_graph/scene_graph";
import { Matrix } from "../util/math";

const nodeConverter = {
    fromAttribute: (id: string) => window.layout.sceneGraph.getNode(id),
    toAttribute: (node: SceneGraphNode | null) => node === null ? "" : node.id 
}

@customElement("node-metadata-view")
export class NodeMetadataView extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: var(--ui-area-padding, 0.75rem);
        }

        div {
            display: flex;
            flex-direction: column;
        }

        td {
            text-align: right;
            width: 33%;
        }
    `;

    @property({ converter: nodeConverter, reflect: true })
    node: SceneGraphNode;

    #matrixTemplate(matrix: Matrix): TemplateResult {
        return html`
            <table>
                <tr>
                    <td>${matrix.a.toFixed(1)}</td><td>${matrix.c.toFixed(1)}</td><td>${matrix.e.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>${matrix.b.toFixed(1)}</td><td>${matrix.d.toFixed(1)}</td><td>${matrix.f.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>0.0</td><td>0.0</td><td>1.0</td>
                </tr>
            </table>
        `;
    }

    render() {
        if (this.node) {
            const metadataTemplates = [];

            for (const key of Object.keys(this.node.metadata)) {
                if (this.node.metadata[key] instanceof Matrix) {
                    metadataTemplates.push(html`<div><span>${key}:</span>${this.#matrixTemplate(this.node.metadata[key])}</div>`);
                } else {
                    metadataTemplates.push(html`<div><span>${key}:</span><span>${this.node.metadata[key]}</span></div>`);
                }
            }
    
            return html`${metadataTemplates}`;
        } else {
            return html``;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "node-metadata-view": NodeMetadataView;
    }
}