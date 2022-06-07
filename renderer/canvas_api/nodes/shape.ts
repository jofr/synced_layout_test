import { Shape } from "../../../layout/nodes/shape";

export function prepareStroke(ctx: CanvasRenderingContext2D, shape: Shape) {
    ctx.strokeStyle = shape.stroke;
    ctx.lineWidth = shape.strokeWidth;
    ctx.lineCap = shape.strokeLinecap;
    ctx.lineJoin = shape.strokeLinejoin;
    ctx.miterLimit = shape.strokeMiterlimit;
    ctx.setLineDash(shape.strokeDasharray);
    ctx.lineDashOffset = shape.strokeDashoffset;
}

export function prepareFill(ctx: CanvasRenderingContext2D, shape: Shape) {
    ctx.fillStyle = shape.fill;
}