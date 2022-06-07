import { Page } from "./nodes/page";
import { Matrix } from "../util/math";

export type BindingContext = {
    method: "book" | "carousel",
    currentPage: number
}

export interface BindingSystem {
    pageTransform(page: Page, context: any): Matrix;
}