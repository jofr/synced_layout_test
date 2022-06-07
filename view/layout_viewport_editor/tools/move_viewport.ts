import { Tool } from "./tool";
import { LayoutViewport } from "../../layout_viewport";
import { Vector } from "../../../util/math";

export class MoveViewportTool extends Tool {
    #viewportScreenStart: Vector = null;
    #pointerStart: Vector = null;

    startDrag(event: CustomEvent): void {
        console.log("startDrag moveViewport")
        this.#viewportScreenStart = this._viewport.viewportScreen;
        this.#pointerStart = event.detail.position.viewport;
        console.log(this.#pointerStart)
    }

    drag(event: CustomEvent): void {
        if (this.#viewportScreenStart === null || this.#pointerStart === null) {
            return;
        }

        const offset = event.detail.position.viewport.subtract(this.#pointerStart);
        this._viewport.viewportScreen = this.#viewportScreenStart.add(offset);
    }

    endDrag(): void {
        this.#viewportScreenStart = null;
        this.#pointerStart = null;
    }
}