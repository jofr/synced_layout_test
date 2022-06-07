import { Shape } from "./shape";
import { BoundingRectangle, Vector } from "../../util/math";

export class Circle extends Shape {
    r: number;

    constructor(properties: any) {
        super(properties);

        this.type.push("Circle");
        
        this.r = properties.r || 1.0;
    }

    static boundingRectangle(circle: Circle): BoundingRectangle {
        const boundingRadius = circle.r + circle.strokeWidth / 2;

        return new BoundingRectangle(
            new Vector(-boundingRadius, -boundingRadius),
            new Vector(boundingRadius, -boundingRadius),
            new Vector(boundingRadius, boundingRadius),
            new Vector(-boundingRadius, boundingRadius)
        );
    }

    static isPointInside(circle: Circle, point: Vector): boolean {
        let d = point.length();

        if (d < circle.r + circle.strokeWidth / 2) {
            return true;
        } else {
            return false;
        }
    }
}