import { Transform } from "./transform";

export class Shape extends Transform {
    stroke: string;
    strokeWidth: number;
    strokeLinecap: "butt" | "round" | "square";
    strokeLinejoin: "miter" | "round" | "bevel";
    strokeMiterlimit: number;
    strokeDasharray: number[];
    strokeDashoffset: number;
    fill: string;
    fillRule: "nonzero" | "evenodd";
    paintOrder: ("fill" | "stroke" | "markers")[];
    shapeRendering: "auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision";

    constructor(properties: any) {
        super(properties);

        this.type.push("Shape");
        
        this.stroke = properties.stroke || "#000000";
        this.strokeWidth = properties.strokeWidth || 0.0;
        this.strokeLinecap = properties.strokeLinecap || "butt";
        this.strokeLinejoin = properties.strokeLinejoin || "miter";
        this.strokeMiterlimit = properties.strokeMiterlimit || 4.0;
        this.strokeDasharray = properties.strokeDasharray || [];
        this.fill = properties.fill || "#000000";
        this.fillRule = properties.fillRule || "nonzero";
        this.paintOrder = properties.paintOrder || "normal";
        this.shapeRendering = properties.shapeRendering || "auto";
    }
}