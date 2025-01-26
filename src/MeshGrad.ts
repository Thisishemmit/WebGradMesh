export default class GradMEsh {
    private element: HTMLElement;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(elementId: string) {
        this.element = document.getElementById(elementId)!;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        
        this.element.appendChild(this.canvas);
        
        this.setSize();

        window.addEventListener('resize', () => this.setSize());
        this.draw();
    }

    private setSize() {
        const rect = this.element.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    }

    public draw() {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        requestAnimationFrame(() => this.draw());
    }
}
