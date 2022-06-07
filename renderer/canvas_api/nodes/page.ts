import { Page } from "../../../layout/nodes/page";
import { Vector } from "../../../util/math";
import { CacheCanvasOffset } from "../renderer";

export function renderer(page: Page, ctx: CanvasRenderingContext2D, cacheCanvas?: HTMLCanvasElement): void | CacheCanvasOffset  {
    if (cacheCanvas) {
        cacheCanvas.width = page.width;
        cacheCanvas.height = page.height;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, page.width, page.height)

    if (cacheCanvas) {
        return new Vector(
            0, 0
        );
    }
}