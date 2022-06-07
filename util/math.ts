export const toFixed = (x: number) => { return x.toFixed(1); };
export const snapToCanvasPixel = (x: number) => { return Math.round(x + 0.5) - 0.5; };

export class Vector {
    readonly _data: [number, number];

    constructor(x: number, y: number) {
        this._data = [x, y];
    }

    add(v: Vector): Vector {
        return new Vector(
            this._data[0] + v._data[0],
            this._data[1] + v._data[1]
        );
    }

    subtract(v: Vector): Vector {
        return new Vector(
            this._data[0] - v._data[0],
            this._data[1] - v._data[1]
        );
    }

    dot(v: Vector): number {
        return this._data[0] * v._data[0] + this._data[1] * v._data[1];
    }

    /* z-component of cross product of both vectors on x-y-plane in 3d space */
    cross(v: Vector): number {
        return this._data[0] * v._data[1] - this._data[1] * v._data[0];
    }

    multiply(x: number): Vector {
        return new Vector(
            this._data[0] * x,
            this._data[1] * x
        );
    }

    divide(x: number): Vector {
        return this.multiply(1.0 / x);
    }

    length(): number {
        return Math.sqrt(this._data[0] * this._data[0] + this._data[1] * this._data[1]);
    }

    normalize(): Vector {
        const length = this.length();
        return this.divide(length);
    }

    get x(): number {
        return this._data[0];
    }

    get y(): number {
        return this._data[1];
    }

    get xy(): [number, number] {
        return [this.x, this.y];
    }

    toString(): string {
        return `Vector(${toFixed(this._data[0])} ${toFixed(this._data[1])})`;
    }
}

export enum MatrixMultiplicationMode {
    Point, Direction
}

export class Matrix {
    readonly _data: number[];

    constructor(matrix: number[]) {
        this._data = matrix;
    }

    static IdentityMatrix(): Matrix {
        return new Matrix([
             1,  0,  0,
             0,  1,  0,
             0,  0,  1
        ]);
    }
    
    static TranslateMatrix(x: number, y: number): Matrix {
        return new Matrix([
             1,  0,  x,
             0,  1,  y,
             0,  0,  1
        ]);
    }
    
    static ScaleMatrix(x: number, y: number): Matrix {
        return new Matrix([
             x,  0,  0,
             0,  y,  0,
             0,  0,  1
        ]);
    }
    
    static RotateMatrix(angle: number): Matrix {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix([
             c, -s,  0,
             s,  c,  0,
             0,  0,  1
        ]);
    }
    
    static ShearMatrix(xAngle: number, yAngle: number) {
        const x = Math.tan(xAngle);
        const y = Math.tan(yAngle);
        return new Matrix([
             1,  x,  0,
             y,  1,  0,
             0,  0,  1
        ]);
    }

    multiply(x: Vector | Matrix, mode: MatrixMultiplicationMode = MatrixMultiplicationMode.Point): Vector | Matrix {
        if (x instanceof Vector) {
            const z = mode === MatrixMultiplicationMode.Direction ? 0.0 : 1.0;
            return new Vector(
                x._data[0] * this._data[0] + x._data[1] * this._data[1] + z * this._data[2],
                x._data[0] * this._data[3] + x._data[1] * this._data[4] + z * this._data[5],
            );
        } else {
            return new Matrix([
                this._data[0] * x._data[0] + this._data[1] * x._data[3] + this._data[2] * x._data[6],
                this._data[0] * x._data[1] + this._data[1] * x._data[4] + this._data[2] * x._data[7],
                this._data[0] * x._data[2] + this._data[1] * x._data[5] + this._data[2] * x._data[8],
                this._data[3] * x._data[0] + this._data[4] * x._data[3] + this._data[5] * x._data[6],
                this._data[3] * x._data[1] + this._data[4] * x._data[4] + this._data[5] * x._data[7],
                this._data[3] * x._data[2] + this._data[4] * x._data[5] + this._data[5] * x._data[8],
                this._data[6] * x._data[0] + this._data[7] * x._data[3] + this._data[8] * x._data[6],
                this._data[6] * x._data[1] + this._data[7] * x._data[4] + this._data[8] * x._data[7],
                this._data[6] * x._data[2] + this._data[7] * x._data[5] + this._data[8] * x._data[8]
            ]);
        }
    }

    invert(): Matrix {
        const det01 = this._data[8] * this._data[4] - this._data[5] * this._data[7];
        const det11 = -this._data[8] * this._data[3] + this._data[5] * this._data[6];
        const det21 = this._data[7] * this._data[3] - this._data[4] * this._data[6];

        let det = this._data[0] * det01 + this._data[1] * det11 + this._data[2] * det21;

        if (!det) {
            return null
        }

        det = 1.0 / det

        return new Matrix([
            det01 * det,
            (-this._data[8] * this._data[1] + this._data[2] * this._data[7]) * det,
            (this._data[5] * this._data[1] - this._data[2] * this._data[4]) * det,
            det11 * det,
            (this._data[8] * this._data[0] - this._data[2] * this._data[6]) * det,
            (-this._data[5] * this._data[0] + this._data[2] * this._data[3]) * det,
            det21 * det,
            (-this._data[7] * this._data[0] + this._data[1] * this._data[6]) * det,
            (this._data[4] * this._data[0] - this._data[1] * this._data[3]) * det
        ]);
    }

    get a(): number {
        return this._data[0];
    }

    get b(): number {
        return this._data[3];
    }

    get c(): number {
        return this._data[1];
    }

    get d(): number {
        return this._data[4];
    }

    get e(): number {
        return this._data[2];
    }

    get f(): number {
        return this._data[5];
    }

    get abcdef(): [number, number, number, number, number, number] {
        return [this.a, this.b, this.c, this.d, this.e, this.f];
    }

    toString(): string {
        return `Matrix(${toFixed(this._data[0])} ${toFixed(this._data[1])} ${toFixed(this._data[2])} ${toFixed(this._data[3])} ${toFixed(this._data[4])} ${toFixed(this._data[5])} ${toFixed(this._data[6])} ${toFixed(this._data[7])} ${toFixed(this._data[8])})`;
    }
}

export class BoundingRectangle {
    readonly _tl: Vector;
    readonly _tr: Vector;
    readonly _br: Vector;
    readonly _bl: Vector;

    constructor(x_tl: number | Vector, y_tr: number | Vector, width_br: number | Vector, height_bl: number | Vector) {
        if (x_tl instanceof Vector && y_tr instanceof Vector && width_br instanceof Vector && height_bl instanceof Vector) {
            this._tl = x_tl;
            this._tr = y_tr;
            this._br = width_br;
            this._bl = height_bl;
        } else {
            const x = x_tl as number;
            const y = y_tr as number;
            const width = width_br as number;
            const height = height_bl as number;

            this._tl = new Vector(x, y);
            this._tr = new Vector(x + width, y);
            this._br = new Vector(x + width, y + height);
            this._bl = new Vector(x, y + height);
        }
    }

    static AlignedEnclosing(objects: (BoundingRectangle | Vector)[]): BoundingRectangle {
        let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
        if (objects[0] instanceof BoundingRectangle) {
            const rectangle = objects[0];
            x0 = rectangle.tl.x;
            y0 = rectangle.tl.y;
            x1 = rectangle.tl.x;
            y1 = rectangle.tl.y;
        } else {
            const point = objects[0];
            x0 = point.x;
            y0 = point.y;
            x1 = point.x;
            y1 = point.y;
        }
        for (const object of objects) {
            if (object instanceof BoundingRectangle) {
                const rectangle = object as BoundingRectangle;
                x0 = Math.min(x0, rectangle.tl.x);
                y0 = Math.min(y0, rectangle.tl.y);
                x1 = Math.max(x1, rectangle.br.x);
                y1 = Math.max(y1, rectangle.br.y);
            } else {
                const point = object as Vector;
                x0 = Math.min(x0, point.x);
                y0 = Math.min(y0, point.y);
                x1 = Math.max(x1, point.x);
                y1 = Math.max(y1, point.y);
            }
        }
        return new BoundingRectangle(
            new Vector(x0, y0),
            new Vector(x1, y0),
            new Vector(x1, y1),
            new Vector(x0, y1)
        );
    }

    transform(transform: Matrix): BoundingRectangle {
        return new BoundingRectangle(
            transform.multiply(this._tl) as Vector,
            transform.multiply(this._tr) as Vector,
            transform.multiply(this._br) as Vector,
            transform.multiply(this._bl) as Vector,
        );
    }

    align(): BoundingRectangle {
        const x = Math.min(this._tl.x, this._tr.x, this._br.x, this._bl.x);
        const y = Math.min(this._tl.y, this._tr.y, this._br.y, this._bl.y);
        const width = Math.max(this._tl.x, this._tr.x, this._br.x, this._bl.x) - x;
        const height = Math.max(this._tl.y, this._tr.y, this._br.y, this._bl.y) - y;

        return new BoundingRectangle(
            new Vector(x, y),
            new Vector(x + width, y),
            new Vector(x + width, y + height),
            new Vector(x, y + height)
        );
    }

    isPointInside(point: Vector): boolean {
        if (Math.abs(this._tl.y - this._tr.y) < 0.5) {
            const x = this._tl.x;
            const y = this._tl.y;
            const width = this._tr.x - this._tl.x;
            const height = this._bl.y - this._tl.y;
            
            if (x < point.x && point.x < x + width && y < point.y && point.y < y + height) {
                return true;
            } else {
                return false;
            }
        } else {
            return false; /* TODO: if BoundingRectangle is not aligned */
        }
    }

    isBoundingRectangleInside(rectangle: BoundingRectangle): boolean {
        if (Math.abs(this._tl.y - this._tr.y) < 0.5 && Math.abs(rectangle._tl.y - rectangle._tr.y) < 0.5) {
            if (rectangle.tl.x > this._tl.x && rectangle.tr.x < this._tr.x && rectangle.tl.y > this._tl.y && rectangle.bl.y < this._bl.y) {
                return true;
            } else {
                return false;
            }
        } else {
            return false; /* TODO: if BoundingRectangles are not aligned */
        }
        
    }

    get tl(): Vector {
        return this._tl;
    }

    get tr(): Vector {
        return this._tr;
    }

    get br(): Vector {
        return this._br;
    }

    get bl(): Vector {
        return this._bl;
    }

    toString(): string {
        return `BoundingRectangle(tl: ${this._tl.xy.map(toFixed)} tr: ${this._tr.xy.map(toFixed)} br: ${this._br.xy.map(toFixed)} bl: ${this._bl.xy.map(toFixed)})`;
    }
}

