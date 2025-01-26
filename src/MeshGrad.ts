import CurvableRect from "./CurvableRect";

let mouse = { x: 0, y: 0 };
addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

export default class GradMEsh {
    private element: HTMLElement;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private Rects: CurvableRect[] = [];

    constructor(elementId: string) {
        this.element = document.getElementById(elementId)!;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;

        this.element.appendChild(this.canvas);

        this.setSize();

        window.addEventListener('resize', () => this.setSize());
        this.Rects.push(new CurvableRect(100, 100, 500, 400));
        this.setupEvents();
        this.draw();
    }

    private setupEvents() {
        addEventListener('mousemove', (e) => {
            this.Rects.forEach(rect => {
                rect.getCurves().forEach(curve => {
                    curve.getPoints().forEach(point => {
                        if (point.isPointInPoint(e.clientX, e.clientY)) {
                            point.hover();
                        } else {
                            point.idle();
                        }
                    });
                });
            });
        });

        addEventListener('pointerdown', (e) => {
            this.Rects.forEach(rect => {
                rect.getCurves().forEach(curve => {
                    curve.getPoints().forEach(point => {
                        if (point.isPointInPoint(e.clientX, e.clientY)) {
                            point.select();
                            point.drag();
                        } else {
                            point.idle();
                        }
                    });
                });
            });
        });

        addEventListener('pointermove', (e) => {
            this.Rects.forEach(rect => {
                rect.getCurves().forEach(curve => {
                    curve.getPoints().forEach(point => {
                        if (point.isDragging()) {
                            point.move(e.clientX, e.clientY);
                        }
                    });
                });
            });
        });

        addEventListener('pointerup', () => {
            this.Rects.forEach(rect => {
                rect.getCurves().forEach(curve => {
                    curve.getPoints().forEach(point => {
                        point.drop();
                    });
                });
            });
        });

    }

    private setSize() {
        const rect = this.element.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    }

    isPointInRect(x: number, y: number) {
    }
    public draw() {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.Rects.length; i++) {
            this.Rects[i].draw(this.ctx);
        }

        if (this.isPointInRect(mouse.x, mouse.y)) {
            this.ctx.fillStyle = 'cyan';
            this.ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.draw());
    }
}
