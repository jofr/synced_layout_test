import { CacheCanvasOffset, cacheCanvasMargin } from "../renderer";
import { prepareFill, prepareStroke } from "./shape";
import { Rectangle } from "../../../layout/nodes/rectangle";
import { Vector } from "../../../util/math";

export function renderer(rectangle: Rectangle, ctx: CanvasRenderingContext2D, cacheCanvas?: HTMLCanvasElement): void | CacheCanvasOffset  {
    if (cacheCanvas) {
        cacheCanvas.width = rectangle.width + rectangle.strokeWidth + 2 * cacheCanvasMargin;
        cacheCanvas.height = rectangle.height + rectangle.strokeWidth + 2 * cacheCanvasMargin;
        ctx.translate(cacheCanvas.width / 2, cacheCanvas.height / 2);
    }

    prepareFill(ctx, rectangle);
    ctx.fillRect(-rectangle.width / 2, -rectangle.height / 2, rectangle.width, rectangle.height);

    if (rectangle.strokeWidth > 0) {
        prepareStroke(ctx, rectangle);
        ctx.strokeRect(-rectangle.width / 2, -rectangle.height / 2, rectangle.width, rectangle.height);
    }

    if (cacheCanvas) {
        return new Vector (
            cacheCanvas.width / 2,
            cacheCanvas.height / 2
        );
    }
}