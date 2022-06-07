import { Typed } from "./typed";

export class Transform extends Typed {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    skewX: number;
    skewY: number;

    constructor(properties: any) {
        super();

        this.type.push("Transform");
        
        this.x = properties.x || 0.0;
        this.y = properties.y || 0.0;
        this.scale = properties.scale || 1.0;
        this.rotation = properties.rotation || 0.0;
        this.skewX = properties.skewX || 0.0;
        this.skewY = properties.skewY || 0.0;
    }
}