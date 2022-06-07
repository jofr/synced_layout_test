import { BoundingRectangle, Vector, snapToCanvasPixel } from "../../util/math";

export enum MarkerType {
    PointMarker = "PointMarker",
    LineMarker = "LineMarker",
    BezierLineMarker = "BezierLineMarker",
    RectangleMarker = "RectangleMarker"
}

export type PointMarker = {
    type: MarkerType | string,
    shape: "Cross" | "Circle" | "Rectangle" | string,
    position: Vector,
    role?: "Handle" | "Guide" | string,
    strokeStyle?: string,
    fillStyle?: string,
    hovered?: boolean
}

export type LineMarker = {
    type: MarkerType | string,
    start: Vector,
    end: Vector,
    strokeStyle?: string,
    fillStyle?: string,
    hovered?: boolean
}

export type BezierLineMarker = {
    type: MarkerType | string,
    start: Vector,
    out: Vector,
    end: Vector,
    in: Vector,
    strokeStyle?: string,
    fillStyle?: string,
    hovered?: boolean
}

export type RectangleMarker = {
    type: MarkerType | string,
    boundingRectangle: BoundingRectangle,
    role?: "Handle" | "Guide" | string,
    strokeStyle?: string,
    fillStyle?: string,
    hovered?: boolean
}

export type Marker = PointMarker | LineMarker | BezierLineMarker | RectangleMarker;

export class MarkerRenderer {
    #ctx: CanvasRenderingContext2D;
    #strokeStyle: string = "#000000";
    #fillStyle: string = "#ffffff";
    #pointMarkerSize: number = 8;

    constructor(ctx: CanvasRenderingContext2D) {
        this.#ctx = ctx;
    }

    #renderCrossShapePointMarker(point: PointMarker) {
        const size = point.hovered ? this.#pointMarkerSize + 2 : this.#pointMarkerSize;
        const halfSize = (point.role && point.role === "Guide") ? size / 4 : size / 2;

        this.#ctx.beginPath();
        this.#ctx.moveTo(point.position.x - halfSize, point.position.y - halfSize);
        this.#ctx.lineTo(point.position.x + halfSize, point.position.y + halfSize);
        this.#ctx.stroke();
        this.#ctx.moveTo(point.position.x - halfSize, point.position.y + halfSize);
        this.#ctx.lineTo(point.position.x + halfSize, point.position.y - halfSize);
        this.#ctx.stroke();
    }

    #renderCircleShapePointMarker(point: PointMarker) {
        const size = point.hovered ? this.#pointMarkerSize + 2 : this.#pointMarkerSize;
        const radius = (point.role && point.role == "Guide") ? size / 4 : size / 2;

        this.#ctx.beginPath();
        this.#ctx.arc(point.position.x, point.position.y, radius, 0, 2 * Math.PI, false);
        this.#ctx.fill();
        this.#ctx.beginPath();
        this.#ctx.arc(point.position.x, point.position.y, radius, 0, 2 * Math.PI, false);
        this.#ctx.stroke();
    }

    #renderRectangleShapePointMarker(point: PointMarker) {
        const size = point.hovered ? this.#pointMarkerSize + 2 : this.#pointMarkerSize;
        const halfSize = (point.role && point.role === "Guide") ? size / 4 : size / 2;

        this.#ctx.fillRect(point.position.x - halfSize, point.position.y - halfSize, this.#pointMarkerSize, this.#pointMarkerSize);
        this.#ctx.strokeRect(point.position.x - halfSize, point.position.y - halfSize, this.#pointMarkerSize, this.#pointMarkerSize);
    }

    #renderPointMarker(point: PointMarker) {
        const render = {
            "Cross": this.#renderCrossShapePointMarker.bind(this),
            "Circle": this.#renderCircleShapePointMarker.bind(this),
            "Rectangle": this.#renderRectangleShapePointMarker.bind(this)
        }

        const snappedPosition = new Vector(point.position.x, point.position.y).xy.map(snapToCanvasPixel);
        point.position = new Vector(snappedPosition[0], snappedPosition[1]);
        render[point.shape](point);
    }

    #renderLineMarker(line: LineMarker) {
        this.#ctx.beginPath(),
        this.#ctx.moveTo(snapToCanvasPixel(line.start.x), snapToCanvasPixel(line.start.y));
        this.#ctx.lineTo(snapToCanvasPixel(line.end.x), snapToCanvasPixel(line.end.y));
        this.#ctx.stroke();
    }

    #renderBezierLineMarker(line: BezierLineMarker) {
        this.#ctx.beginPath(),
        this.#ctx.moveTo(snapToCanvasPixel(line.start.x), snapToCanvasPixel(line.start.y));
        this.#ctx.bezierCurveTo(line.out.x, line.out.y, line.in.x, line.in.y, line.end.x, line.end.y);
        this.#ctx.stroke();
    }

    #renderRectangleMarker(rectangle: RectangleMarker) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(snapToCanvasPixel(rectangle.boundingRectangle.tl.x), snapToCanvasPixel(rectangle.boundingRectangle.tl.y));
        this.#ctx.lineTo(snapToCanvasPixel(rectangle.boundingRectangle.tr.x), snapToCanvasPixel(rectangle.boundingRectangle.tr.y));
        this.#ctx.lineTo(snapToCanvasPixel(rectangle.boundingRectangle.br.x), snapToCanvasPixel(rectangle.boundingRectangle.br.y));
        this.#ctx.lineTo(snapToCanvasPixel(rectangle.boundingRectangle.bl.x), snapToCanvasPixel(rectangle.boundingRectangle.bl.y));
        this.#ctx.closePath();
        this.#ctx.stroke();
    }

    renderMarkers(markers: Marker[]) {
        const render = {
            "PointMarker": this.#renderPointMarker.bind(this),
            "LineMarker": this.#renderLineMarker.bind(this),
            "BezierLineMarker": this.#renderBezierLineMarker.bind(this),
            "RectangleMarker": this.#renderRectangleMarker.bind(this)
        }

        this.#ctx.save();
        this.#ctx.lineWidth = 1;
        this.#ctx.strokeStyle = this.#strokeStyle;
        this.#ctx.fillStyle = this.#fillStyle;

        for (let marker of markers) {
            if (marker.strokeStyle) {
                this.#ctx.strokeStyle = marker.strokeStyle;
            }
            if (marker.fillStyle) {
                this.#ctx.fillStyle = marker.fillStyle;
            }
            render[marker.type](marker);
        }

        this.#ctx.restore();
    }

    set strokeStyle(strokeStyle: string) {
        this.#strokeStyle = strokeStyle;
    }

    set fillStyle(fillStyle: string) {
        this.#fillStyle = fillStyle;
    }
}