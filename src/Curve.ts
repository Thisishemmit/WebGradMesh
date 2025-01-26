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
    }

    public setEndPoint(p: Point) {
        this.points[3] = p;
    }

    public setControlPoint1(p: Point) {
        this.points[1] = p;
    }

    public setControlPoint2(p: Point) {
        this.points[2] = p;
    }

    public getControlPoint1() {
        return this.points[1];
    }

    public getControlPoint2() {
        return this.points[2];
    }
}
