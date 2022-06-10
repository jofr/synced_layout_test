import { Tool } from "./tool";
import { LayoutViewport } from "../../layout_viewport";
import { Vector } from "../../../util/math";

export class MoveViewportTool extends Tool {
    #viewportScreenStart: Vector = null;
    #pointerStart: Vector = null;

    startDrag(event: CustomEvent): void {
        console.log("startDrag moveViewport")
        this.#viewportScreenStart = new Vector(
            this._viewport.viewportX,
            this._viewport.viewportY,
        )
        this.#pointerStart = event.detail.position.viewport;
    }

    drag(event: CustomEvent): void {
        if (this.#viewportScreenStart === null || this.#pointerStart === null) {
            return;
        }

        const offset = event.detail.position.viewport.subtract(this.#pointerStart);
        const viewportScreen = this.#viewportScreenStart.add(offset);
        this._viewport.viewportX = viewportScreen.x;
        this._viewport.viewportY = viewportScreen.y;
    }

    endDrag(): void {
        this.#viewportScreenStart = null;
        this.#pointerStart = null;
    }
}