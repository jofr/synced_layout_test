import { Events } from "../../../util/events";
import { LayoutViewport } from "../../layout_viewport";
import { LayoutNode } from "../../../layout/nodes";
import { Marker } from "../marker_renderer";
import { MatrixMultiplicationMode, Vector } from "../../../util/math";

export class Tool extends Events {
    _viewport: LayoutViewport;

    constructor(viewport: LayoutViewport) {
        super();

        this._viewport = viewport;
    }

    click(event: CustomEvent): void { }

    startDrag(event: CustomEvent): void { }

    drag(event: CustomEvent): void { }

    endDrag(event: CustomEvent): void { }

    abort(): void {
        this.emit("finished");
    }

    prepareHover(position: Vector): void { }

    get markers(): Marker[] | null {
        return null;
    }
}