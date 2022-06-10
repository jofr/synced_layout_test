import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { SceneGraph } from "../scene_graph/scene_graph";
import { Layout } from "../layout/layout";
import { LayoutNode } from "../layout/nodes";
import { TransformCache } from "../metadata_cache/transform_cache";
import { BoundsCache } from "../metadata_cache/bounds_cache";
import { CanvasAPICompositor } from "../renderer/canvas_api/compositor";
import { Matrix, Vector } from "../util/math";

@customElement("layout-viewport")
export class LayoutViewport extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        canvas {
            width: 100%;
            height: 100%;
            background: #383838;
        }
    `;

    @property({ reflect: true })
    viewportX: number = 0.0;

    @property({ reflect: true })
    viewportY: number = 0.0;

    @property({ reflect: true })
    worldX: number = 0.0;

    @property({ reflect: true })
    worldY: number = 0.0;

    @property({ reflect: true })
    zoom: number = 1.0;

    #transform: Matrix;
    #inverseTransform: Matrix;

    #startTime: number = performance.now();
    #frames: number = 0;
    #fps: number = 0;

    _layout: Layout | null = null;
    _sceneGraph: SceneGraph | null = null;
    _compositor: CanvasAPICompositor | null = null;
    _canvasElement: HTMLCanvasElement | null = null;
    _ctx: CanvasRenderingContext2D | null = null;

    _beforeComposite() {

    }

    _afterComposite() {

    }

    #calculateTransforms() {
        const translateWorld = Matrix.TranslateMatrix(-this.worldX, -this.worldY);
        const scale = Matrix.ScaleMatrix(this.zoom, this.zoom);
        const translateScreen = Matrix.TranslateMatrix(this.viewportX, this.viewportY);
        this.#transform = translateScreen.multiply(scale.multiply(translateWorld)) as Matrix;
        this.#inverseTransform = this.#transform.invert();
    }

    _calculateZoomToFit(node: LayoutNode) {
        if (!node.metadata.alignedBoundingRectangle) {
            return 1.0;
        }

        const boundingRectangle = node.metadata.alignedBoundingRectangle;
        const widthZoom = this._canvasElement.width / (boundingRectangle.tr.x - boundingRectangle.tl.x);
        const heightZoom = this._canvasElement.height / (boundingRectangle.bl.y - boundingRectangle.tl.y);
        return Math.min(widthZoom, heightZoom);
    }

    fit(node: LayoutNode = this._sceneGraph.getNode(this._sceneGraph.rootNodeId) as LayoutNode): void {
        const zoom = this._calculateZoomToFit(node);
        const boundingRectangle = node.metadata.alignedBoundingRectangle;
        
        const viewport = new Vector(this._canvasElement.width / 2, this._canvasElement.height / 2);
        this.viewportX = viewport.x;
        this.viewportY = viewport.y;
        const world = boundingRectangle.tl.add(boundingRectangle.br).divide(2.0);
        this.worldX = world.x;
        this.worldY = world.y;
        this.zoom = zoom;
        this.#calculateTransforms();
    }

    #update() {
        this._ctx.clearRect(0, 0, this._canvasElement.width, this._canvasElement.height);

        this._beforeComposite();

        this._sceneGraph.update();
        this._compositor.renderAndComposeAll();

        this._afterComposite();

        this.#frames++;
        const now = performance.now();
        if (now - this.#startTime > 1000) {
            this.#fps = this.#frames/(now - this.#startTime) * 1000;
            this.#startTime = now;
            this.#frames = 0;
        }

        requestAnimationFrame(this.#update.bind(this));        
    }

    _onPointerDown(event: PointerEvent): void {
        
    }

    _onPointerMove(event: PointerEvent): void {

    }

    _onWheel(event: WheelEvent): void {

    }

    render() {
        this.#calculateTransforms();

        return html`
            <canvas @pointerdown=${this._onPointerDown} @pointermove=${this._onPointerMove} @wheel=${this._onWheel}>
                <slot></slot>
            </canvas>
        `
    }

    set layout(layout: Layout) {
        this._layout = layout;
        this._sceneGraph = layout.sceneGraph;
        this._sceneGraph.addSystem(new TransformCache());
        this._sceneGraph.addSystem(new BoundsCache());
        this._compositor = new CanvasAPICompositor(this._sceneGraph, this);

        this._canvasElement = this.shadowRoot.querySelector("canvas");
        this._ctx = this._canvasElement.getContext("2d");
        this._canvasElement.width = this._canvasElement.clientWidth;
        this._canvasElement.height = this._canvasElement.clientHeight;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                this._canvasElement.width = entry.contentBoxSize[0].inlineSize;
                this._canvasElement.height = entry.contentBoxSize[0].blockSize;
            }
        });
        resizeObserver.observe(this._canvasElement);

        this.#calculateTransforms();

        requestAnimationFrame(this.#update.bind(this));
    }

    get layout() {
        return this._layout;
    }

    get sceneGraph() {
        return this._sceneGraph;
    }

    get transform() {
        return this.#transform;
    }

    get inverseTransform() {
        return this.#inverseTransform;
    }

    get ctx() {
        return this._ctx;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "layout-viewport": LayoutViewport;
    }
}