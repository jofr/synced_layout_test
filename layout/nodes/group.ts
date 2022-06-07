import { Transform } from "./transform";

export class Group extends Transform {
    constructor(properties: any) {
        super(properties);

        this.type.push("Group");
    }
}