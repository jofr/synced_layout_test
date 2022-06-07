import { BindingSystem, BindingContext } from "../binding_system";
import { Page } from "../nodes/page";
import { Matrix } from "../../util/math";

export class BookBinding implements BindingSystem {
    pageTransform(page: Page, context: BindingContext): Matrix {
        let evenOrOdd = (context.currentPage % 2 == 0) ? -1 : 1;
        return Matrix.TranslateMatrix(evenOrOdd == -1 ? -page.width : 0, Math.ceil((context.currentPage - 1)/2) * (page.height + 20));
    }
}