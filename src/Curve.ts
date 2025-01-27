import { InteractState, StyleConfig } from "./interfaces";
import Point from "./Point";

const defaultConfig: StyleConfig = {
    default: {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1
    },
    hover: {
        fill: '#242424',
        stroke: 'blue',
        strokeWidth: 1
    },
    select: {
        fill: '#A9A9A9',
        stroke: 'blue',
        strokeWidth: 1
    }
}
export default class Curve {
    private state = InteractState.default;
    private config: StyleConfig;
    private points: Point[];
    private cachedBBox: { min: Point, max: Point } | null = null;
    constructor(p1: Point, p2: Point, p3: Point, p4: Point, config: StyleConfig = defaultConfig) {
        this.points = [p1, p2, p3, p4];
        this.config = config;

        this.setupEvents();
    }

    private setupEvents() {
        this.points.forEach(point => {
            point.onHover(() => {
                if (!this.isHovered()) this.hover();
            });
            point.onSelect(() => {
                if (!this.isSelect()) this.select();
            });
            point.onIdle(() => {
                if (!this.isIdle()) this.idle();
            });
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.bezierCurveTo(this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y, this.points[3].x, this.points[3].y);
        ctx.lineWidth = this.config[this.state].strokeWidth;
        ctx.strokeStyle = this.config[this.state].stroke;
        ctx.stroke();
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].draw(ctx);
        }
    }

    public isPointInCurve(x: number, y: number) {
        const t = 0.5;
        const x1 = this.points[0].x;
        const y1 = this.points[0].y;
        const x2 = this.points[1].x;
        const y2 = this.points[1].y;
        const x3 = this.points[2].x;
        const y3 = this.points[2].y;
        const x4 = this.points[3].x;
        const y4 = this.points[3].y;

        const x_t = Math.pow(1 - t, 3) * x1 + 3 * Math.pow(1 - t, 2) * t * x2 + 3 * (1 - t) * Math.pow(t, 2) * x3 + Math.pow(t, 3) * x4;
        const y_t = Math.pow(1 - t, 3) * y1 + 3 * Math.pow(1 - t, 2) * t * y2 + 3 * (1 - t) * Math.pow(t, 2) * y3 + Math.pow(t, 3) * y4;

        return Math.abs(x - x_t) < 5 && Math.abs(y - y_t) < 5;
    }

    public hover() {
        this.state = InteractState.hover;
    }

    public select() {
        this.state = InteractState.select;
    }

    public idle() {
        this.state = InteractState.default;
    }

    public isHovered() {
        return this.state === InteractState.hover;
    }

    public isIdle() {
        return this.state === InteractState.default;
    }

    public isSelect() {
        return this.state === InteractState.select;
    }

    public getPoints() {
        return this.points;
    }

    public setStartPoint(p: Point) {
        this.points[0] = p;
        this.cachedBBox = null;
    }

    public setEndPoint(p: Point) {
        this.points[3] = p;
        this.cachedBBox = null;
    }

    public setControlPoint1(p: Point) {
        this.points[1] = p;
        this.cachedBBox = null;
    }

    public setControlPoint2(p: Point) {
        this.points[2] = p;
        this.cachedBBox = null;
    }

    public getControlPoint1() {
        return this.points[1];
    }

    public getControlPoint2() {
        return this.points[2];
    }

    public getBoundingBox(){
        const [min, max] = this.calculateExtremes();
        this.cachedBBox = {min, max};
        return this.cachedBBox;
    }

    private calculateExtremes() {
        const tx = this.findExtrema('x');
        const ty = this.findExtrema('y');

        const points = [0, 1, ...tx, ...ty].map(t => this.getPoint(t));

        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        return [
            new Point(Math.min(...xs), Math.min(...ys)),
            new Point(Math.max(...xs), Math.max(...ys))
        ];
    }
    private findExtrema(axis: 'x' | 'y') {
        const p0 = this.points[0][axis];
        const p1 = this.points[1][axis];
        const p2 = this.points[2][axis];
        const p3 = this.points[3][axis];

        const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3);
        const b = 6 * (p0 - 2 * p1 + p2);
        const c = 3 * (p1 - p0);

        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return [];
        const sqrtD = Math.sqrt(discriminant);

        return [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)]
            .filter(t => t >= 0 && t <= 1);
    }

    public getPoint(t: number) {
        const x = Math.pow(1 - t, 3) * this.points[0].x + 3 * Math.pow(1 - t, 2) * t * this.points[1].x +
            3 * (1 - t) * Math.pow(t, 2) * this.points[2].x + Math.pow(t, 3) * this.points[3].x;
        const y = Math.pow(1 - t, 3) * this.points[0].y + 3 * Math.pow(1 - t, 2) * t * this.points[1].y +
            3 * (1 - t) * Math.pow(t, 2) * this.points[2].y + Math.pow(t, 3) * this.points[3].y;
        return new Point(x, y);
    }


}
