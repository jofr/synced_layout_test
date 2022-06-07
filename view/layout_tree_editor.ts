import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import { repeat } from "lit/directives/repeat";
import { SceneGraph, SceneGraphNode } from "../scene_graph/scene_graph";
import { Layout } from "../layout/layout";
import { LayoutNode } from "../layout/nodes";
import { LayoutSelection } from "../layout/layout_selection";

@customElement("layout-tree-editor")
export class LayoutTreeEditor extends LitElement {
    static styles = css`
        :host {
            --line-height: 1.75rem;
            display: block;
            user-select: none;
            line-height: var(--line-height);
            min-height: 100%;
            background: repeating-linear-gradient(#232323, #232323 var(--line-height), #272727 var(--line-height), #272727 calc(2 * var(--line-height)));
        }

        div.node {
            position: relative;
            display: block;
            padding-left: 0.75rem;
            z-index: 0;
        }

        div.node.selected::before {
            content: '';
            background: repeating-linear-gradient(#50a0ff99, #50a0ff99 var(--line-height), #50a0ff33 var(--line-height), #50a0ff33 100%);
            opacity: 0.5;
            position: absolute;
            top: 0px;
            left: -50%;
            width: 150%;
            height: 100%;
            z-index: -1;
        }

        div.node div.node-name {
            position: relative;
        }

        div.node div.node-name::before {
            display: none;
            content: '';
            position: absolute;
            top: 0px;
            left: -50%;
            width: 150%;
            height: 100%;
            z-index: -1;
        }

        div.node div.node-name:hover::before {
            display: block;
            background: #d9d9d9;
            opacity: 0.2;
        }

        div.node div.node-name.current-drop-target::before {
            display: block;
            background: red;
            opacity: 0.2;
        }

        div.node div.node-name div.drop-target {
            position: absolute;
            display: block;
            width: 100%;
            height: 3px;
            left: 1.0rem;
        }

        div.node div.node-name div.drop-target.before {
            top: -3px;
            border-top: 3px solid transparent;
        }

        div.node div.node-name div.drop-target.after {
            bottom: -3px;
            border-bottom: 3px solid transparent;
        }

        div.node div.node-name div.drop-target.current-drop-target.before {
            border-top: 3px solid red;
        }

        div.node div.node-name div.drop-target.current-drop-target.after {
            border-bottom: 3px solid red;
        }

        div.node div.node-name div.drop-target.current-drop-target {
            background: red;
            opacity: 0.2;
        }

        div.node div.node-name span {
            pointer-events: none;
        }

        div.node i {
            font-style: normal;
        }

        div.node i::before {
            display: inline-block;
            width: 0.75rem;
            content: '▾';
            text-align: center;
            margin-right: 0.25rem;
        }

        div.node.no-children i::before {
            content: '';
        }

        div.node:not(.expanded) i::before {
            content: '▸';
        }

        div.node:not(.no-children) > div.children {
            background: repeating-linear-gradient(90deg, transparent, transparent 0.375rem, #ffffff 0.375rem, #ffffff calc(0.375rem + 1px), transparent calc(0.375rem + 1px), transparent 100%);
        }

        div.node:not(.expanded) > div.children {
            display: none;
        }
    `;

    #sceneGraph: SceneGraph | null = null;
    #selection: LayoutSelection | null = null;

    #dragStart(node: LayoutNode, event: DragEvent) {
        event.stopPropagation();
        const dragElement = document.createElement("div");
        dragElement.innerText = "foo";
        dragElement.style.width = "200px";
        document.body.appendChild(dragElement);
        event.dataTransfer.setDragImage(dragElement, 0, 0);
        event.dataTransfer.setData("text/node-id", node.id);
        event.dataTransfer.effectAllowed = "all";
    }

    #dropType(event: DragEvent) {
        if (event.ctrlKey) {
            return "copy";
        } else {
            return "move";
        }
    }

    #dragEnter(event: DragEvent) {
        if (event.dataTransfer.types.includes("text/node-id")) {
            (event.target as HTMLElement).classList.add("current-drop-target");
            event.dataTransfer.dropEffect = this.#dropType(event);
        }
    }

    #dragOver(event: DragEvent) {
        if (event.dataTransfer.types.includes("text/node-id") && (event.target as HTMLElement) !== this) {
            event.preventDefault();
            event.dataTransfer.dropEffect = this.#dropType(event);
        }
    }

    #dragLeave(event: DragEvent) {
        (event.target as HTMLElement).classList.remove("current-drop-target");
    }

    #drop(node: LayoutNode, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        (event.target as HTMLElement).classList.remove("current-drop-target");
        const nodeId = event.dataTransfer.getData("text/node-id");
        if (this.#dropType(event) == "move") {
            if ((event.target as HTMLElement).classList.contains("before")) {
                console.log("before");
                window.layout.moveNodeBefore(window.layout.sceneGraph.getNode(nodeId) as LayoutNode, node as LayoutNode);
            } else if ((event.target as HTMLElement).classList.contains("after")) {
                console.log("after");
                window.layout.moveNodeAfter(window.layout.sceneGraph.getNode(nodeId) as LayoutNode, node as LayoutNode);
            } else {
                window.layout.reparentNode(window.layout.sceneGraph.getNode(nodeId) as LayoutNode, node as LayoutNode);
            }
        } else {
            console.log("TODO: copy node"); /* TODO */
        }
    }

    #nodeTemplate = (node: LayoutNode): TemplateResult => {
        const hasChildren = node.children.length > 0;
        const isSelected = this.#selection?.get().length > 0 && this.#selection.get()[0].id === node.id;
        return html`
            <div class="node expanded ${classMap({"no-children": !hasChildren, "selected": isSelected})}">
                <div
                class="node-name"
                draggable="true"
                @click=${() => this.#selection.set(node)}
                @dragstart=${(event: DragEvent) => this.#dragStart(node, event)}
                @dragenter=${this.#dragEnter}
                @dragover=${this.#dragOver}
                @dragleave=${this.#dragLeave}
                @drop=${(event: DragEvent) => this.#drop(node, event)}>
                    <div class="drop-target before"></div>
                    <i @click=${(event) => { event.stopPropagation(); event.target.parentNode.parentNode.classList.toggle('expanded'); }}></i>
                    <span>${Layout.mainType(node as LayoutNode)}</span>
                    <div class="drop-target after"></div>
                </div>
                <div class="children">
                    ${repeat(node.children, (child) => child.id, this.#nodeTemplate)}
                </div>
            </div>
        `
    }

    render() {
        if (this.#sceneGraph?.rootNode) {
            return html`
                ${this.#nodeTemplate(this.#sceneGraph.rootNode as LayoutNode)}
            `;
        } else {
            return html``;
        }
    }

    set sceneGraph(sceneGraph: SceneGraph) {
        this.#sceneGraph = sceneGraph;
        this.#sceneGraph.on("nodeCreated", () => this.requestUpdate());
        this.#sceneGraph.on("nodeMoved", () => this.requestUpdate());

        this.requestUpdate();
    }

    set selection(selection: LayoutSelection) {
        this.#selection = selection;
        this.#selection.on("changed", () => this.requestUpdate());

        this.requestUpdate();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "layout-tree-editor": LayoutTreeEditor;
    }
}