import { Typed } from "./typed";
import { BoundingRectangle, Vector } from "../../util/math";

export class Page extends Typed {
    width: number;
    height: number;

    constructor(properties: any) {
        super();

        this.type.push("Page");

        this.width = properties.width || 100.0;
        this.height = properties.height || 100.0;
    }

    static boundingRectangle(page: Page): BoundingRectangle {
        return new BoundingRectangle(
            new Vector(0.0, 0.0),
            new Vector(page.width, 0.0),
            new Vector(page.width, page.height),
            new Vector(0.0, page.height)
        );
    }
}