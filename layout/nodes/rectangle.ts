import { Shape } from "./shape";
import { BoundingRectangle, Vector } from "../../util/math";

export class Rectangle extends Shape {
    width: number;
    height: number;

    constructor(properties: any) {
        super(properties);

        this.type.push("Rectangle");
        
        this.width = properties.width || 1.0;
        this.height = properties.height || 1.0;
    }

    static boundingRectangle(rectangle: Rectangle): BoundingRectangle {
        const halfWidth = rectangle.width / 2;
        const halfHeight = rectangle.height / 2;
        const halfStrokeWidth = rectangle.strokeWidth / 2;
        return new BoundingRectangle(
            new Vector(-halfWidth - halfStrokeWidth, -halfHeight - halfStrokeWidth),
            new Vector(halfWidth + halfStrokeWidth, -halfHeight - halfStrokeWidth),
            new Vector(halfWidth + halfStrokeWidth, halfHeight + halfStrokeWidth),
            new Vector(-halfWidth - halfStrokeWidth, halfHeight + halfStrokeWidth)

        );
    }

    static isPointInside(rectangle: Rectangle, point: Vector): boolean {
        let topLeft = new Vector(-rectangle.width / 2 - rectangle.strokeWidth / 2, -rectangle.height / 2 - rectangle.strokeWidth / 2);
    
        if (point.x > topLeft.x && point.x < topLeft.x + rectangle.width + rectangle.strokeWidth && point.y > topLeft.y && point.y < topLeft.y + rectangle.height + rectangle.strokeWidth) {
            return true;
        } else {
            return false;
        }
    }
}