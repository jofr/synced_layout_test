import { Typed } from "./typed";

export class Binding extends Typed {
    method: "book" | "carousel";

    constructor(properties: any) {
        super();

        this.type.push("Binding");
        
        this.method = properties.method || "book";
    }
}