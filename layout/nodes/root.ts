import { Typed } from "./typed";

export class Root extends Typed {
    constructor(properties: any) {
        super();

        this.type.push("Root");
    }
}