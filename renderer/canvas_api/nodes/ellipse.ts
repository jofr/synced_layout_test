import { CacheCanvasOffset, cacheCanvasMargin } from "../renderer";
import { prepareFill, prepareStroke } from "./shape";
import { Ellipse } from "../../../layout/nodes/ellipse";
import { Vector } from "../../../util/math";

export function renderer(ellipse: Ellipse, ctx: CanvasRenderingContext2D, cacheCanvas?: HTMLCanvasElement): void | CacheCanvasOffset  {
    if (cacheCanvas) {
        cacheCanvas.width = 2 * ellipse.rx + ellipse.strokeWidth + 2 * cacheCanvasMargin;
        cacheCanvas.height = 2 * ellipse.ry + ellipse.strokeWidth + 2 * cacheCanvasMargin;
        ctx.translate(cacheCanvas.width / 2, cacheCanvas.height / 2);
    }

    const ellipsePath = () => {
        ctx.ellipse(
            0,
            0,
            ellipse.rx,
            ellipse.ry,
            0,
            0, 2 * Math.PI,
            false
        );
    }

    prepareFill(ctx, ellipse);
    ctx.beginPath();
    ellipsePath();
    ctx.fill();

    if (ellipse.strokeWidth > 0) {
        prepareStroke(ctx, ellipse);
        ctx.beginPath();
        ellipsePath();
        ctx.stroke();
    }

    if (cacheCanvas) {
        return new Vector(
            cacheCanvas.width / 2,
            cacheCanvas.height / 2
        )
    }
}