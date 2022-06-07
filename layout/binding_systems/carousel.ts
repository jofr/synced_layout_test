import { BindingContext, BindingSystem } from "../binding_system";
import { Page } from "../nodes/page";
import { Matrix } from "../../util/math";

export class CarouselBinding implements BindingSystem {
    pageTransform(page: Page, context: BindingContext): Matrix {
        return Matrix.TranslateMatrix((context.currentPage - 1) * page.width, 0);
    }
}