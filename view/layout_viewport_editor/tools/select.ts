import { Tool } from "./tool";
import { LayoutViewport } from "../../layout_viewport";
import { LayoutSelection } from "../../../layout/layout_selection";
import { BoundingRectangle, Vector } from "../../../util/math";
import { Marker, RectangleMarker } from "../marker_renderer";

export class SelectTool extends Tool {
    #selection: LayoutSelection;
    #worldStart: Vector = null;
    #viewportStart: Vector = null;
    #viewportSelectionRectangle: BoundingRectangle;

    constructor(viewport: LayoutViewport, selection: LayoutSelection) {
        super(viewport);

        this.#selection = selection;
    }

    click(event: CustomEvent): void {
        const nodes = this._viewport.layout.findNodes(event.detail.position.world);

        if (event.detail.shiftKey && nodes.length > 0) {
            this.#selection.toggle(nodes[0]);
        } else if (nodes.length > 0) {
            this.#selection.set(nodes[0]);
        } else {
            this.#selection.set(null);
        }
    }

    startDrag(event: CustomEvent): void {
        this.#worldStart = event.detail.position.world;
        this.#viewportStart = event.detail.position.viewport;
    }

    drag(event: CustomEvent): void {
        if (this.#worldStart === null || this.#viewportStart === null) {
            return;
        }

        this.#viewportSelectionRectangle = BoundingRectangle.AlignedEnclosing([
            this.#viewportStart,
            event.detail.position.viewport
        ]);
        const selectionRectangle = BoundingRectangle.AlignedEnclosing([
            this.#worldStart,
            event.detail.position.world
        ]);
        const nodes = this._viewport.layout.findNodes(selectionRectangle);
        this.#selection.set(nodes);
    }

    endDrag(): void {
        this.#worldStart = null;
        this.#viewportStart = null;
    }

    get markers(): Marker[] | null {
        if (this.#worldStart === null || this.#viewportStart === null) {
            return null;
        }

        return [{
            type: "RectangleMarker",
            boundingRectangle: this.#viewportSelectionRectangle
        }];
    }
}