import { InteractState, StyleConfig } from "./interfaces";

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


export default class Point {
    private state = InteractState.default;
    private events: { [key: string]: Function[] } = {};
    private draging = false;
    constructor(public x: number, public y: number, public r: number = 5, private config: StyleConfig = defaultConfig) { }


    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = this.config[this.state].fill;
        ctx.fill();
        ctx.lineWidth = this.config[this.state].strokeWidth;
        ctx.strokeStyle = this.config[this.state].stroke;
        ctx.stroke();
    }

    private on(event: string, cb: Function) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(cb);
    }

    private emit(event: string, ...args: any[]) {
        if (this.events[event]) {
            this.events[event].forEach(cb => {
                cb(...args);
            });
        }
    }
    public onHover(cb: Function) {
        this.on('hover', cb);
    }

    public onSelect(cb: Function) {
        this.on('select', cb);
    }

    public onIdle(cb: Function) {
        this.on('idle', cb);
    }

    public hover() {
        this.state = InteractState.hover;
        this.emit('hover');
    }

    public select() {
        this.state = InteractState.select;
        this.emit('select');
    }

    public idle() {
        this.state = InteractState.default;
        this.emit('idle');
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

    public isPointInPoint(x: number, y: number) {
        return Math.abs(this.x - x) < this.r && Math.abs(this.y - y) < this.r;
    }

    public move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }


    public isDragging() {
        return this.draging;
    }

    public drag() {
        this.draging = true;
    }

    public drop() {
        this.draging = false;
    }
}
