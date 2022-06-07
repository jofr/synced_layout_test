import { Shape } from "./shape";
import { BoundingRectangle, Vector } from "../../util/math";

export class Ellipse extends Shape {
    rx: number;
    ry: number;

    constructor(properties: any) {
        super(properties);

        this.type.push("Ellipse");
        
        this.rx = properties.ry || 1.0;
        this.ry = properties.rx || 1.0;
    }

    static boundingRectangle(ellipse: Ellipse): BoundingRectangle {
        const boundingRadiusX = ellipse.rx + ellipse.strokeWidth / 2;
        const boundingRadiusY = ellipse.ry + ellipse.strokeWidth / 2;

        return new BoundingRectangle(
            new Vector(-boundingRadiusX, -boundingRadiusY),
            new Vector(boundingRadiusX, -boundingRadiusY),
            new Vector(boundingRadiusX, boundingRadiusY),
            new Vector(-boundingRadiusX, boundingRadiusY)
        );
    }

    static isPointInside(ellipse: Ellipse, point: Vector): boolean {
        if ((Math.pow(point.x, 2)/Math.pow(ellipse.rx, 2) + Math.pow(point.y, 2)/Math.pow(ellipse.ry, 2)) <= 1.0) {
            return true;
        } else {
            return false;
        }
    }
}