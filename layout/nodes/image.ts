import { Transform } from "./transform";

export class Image extends Transform {
    url: string;
    imageRendering: "auto" | "optimizeSpeed" | "optimizeQuality";

    constructor(properties: any) {
        super(properties);

        this.type.push("Image");
        
        this.url = properties.url || "";
        this.imageRendering = properties.imageRendering || "auto";
    }
}