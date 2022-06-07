import { CacheCanvasOffset, cacheCanvasMargin } from "../renderer";
import { prepareFill, prepareStroke } from "./shape";
import { Circle } from "../../../layout/nodes/circle";
import { Vector } from "../../../util/math";

export function renderer(circle: Circle, ctx: CanvasRenderingContext2D, cacheCanvas?: HTMLCanvasElement): void | CacheCanvasOffset  {
    if (cacheCanvas) {
        cacheCanvas.width = 2 * circle.r + circle.strokeWidth + 2 * cacheCanvasMargin;
        cacheCanvas.height = 2 * circle.r + circle.strokeWidth + 2 * cacheCanvasMargin;
        ctx.translate(cacheCanvas.width / 2, cacheCanvas.height / 2);
    }

    const arcPath = () => {
        ctx.arc(
            0,
            0,
            circle.r,
            0, 2 * Math.PI,
            false
        );
    };

    prepareFill(ctx, circle);
    ctx.beginPath();
    arcPath();
    ctx.fill();

    if (circle.strokeWidth > 0) {
        prepareStroke(ctx, circle);
        ctx.beginPath();
        arcPath()
        ctx.stroke();
    }

    if (cacheCanvas) {
        return new Vector (
            cacheCanvas.width / 2,
            cacheCanvas.height / 2
        );
    }
}