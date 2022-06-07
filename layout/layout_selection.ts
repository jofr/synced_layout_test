import { Events } from "../util/events";
import { LayoutNode } from "../layout/nodes";
import { Layout } from "../layout/layout";

export class LayoutSelection extends Events {
    #layout: Layout;
    #nodes: Set<LayoutNode> = new Set<LayoutNode>();

    constructor(layout: Layout) {
        super();

        this.#layout = layout;
    }

    set(nodes: LayoutNode | LayoutNode[]): void {
        nodes = nodes ? nodes : [];
        nodes = nodes instanceof Array ? nodes : [nodes];
        this.#nodes.clear();
        for (const node of nodes) {
            this.#nodes.add(node);
        }

        this.emit("changed");
    }

    add(nodes: LayoutNode | LayoutNode[]) {
        nodes = nodes instanceof Array ? nodes : [nodes];
        for (const node of nodes) {
            this.#nodes.add(node);
        }

        this.emit("changed");
    }

    toggle(nodes: LayoutNode | LayoutNode[]) {
        nodes = nodes instanceof Array ? nodes : [nodes];
        for (const node of nodes) {
            if (this.#nodes.has(node)) {
                this.#nodes.delete(node);
            } else {
                this.#nodes.add(node);
            }
        }
        
        this.emit("changed");
    }

    clear(): void {
        this.#nodes.clear();

        this.emit("changed");
    }

    group(): void {
        let groupNode = this.#layout.groupNodes(Array.from(this.#nodes));
        if (groupNode) {
            this.set(groupNode);
        }
    }

    ungroup(): void {
        if (this.#nodes.size === 1) {
            this.#layout.ungroupNode(this.get()[0]);
            this.clear();
        }
    }

    remove(): void {
        if (this.#nodes.size > 0) {
            for (const node of this.#nodes) {
                this.#layout.removeNode(node);
            }
            this.clear();
        }
    }

    get(): LayoutNode[] {
        return Array.from(this.#nodes);
    }
}