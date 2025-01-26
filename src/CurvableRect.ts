import Curve from "./Curve";
import Point from "./Point";

export default class CurvableRect {
    private curves: Curve[];
    constructor(public x: number, public y: number, public width: number, public height: number) {
        this.curves = [
            new Curve(
                new Point(x, y),
                new Point(x + width * 0.3, y),
                new Point(x + width * 0.7, y),
                new Point(x + width, y)
            ),
            new Curve(
                new Point(x + width, y),
                new Point(x + width, y + height * 0.3),
                new Point(x + width, y + height * 0.7),
                new Point(x + width, y + height)
            ),
            new Curve(
                new Point(x + width, y + height),
                new Point(x + width * 0.7, y + height),
                new Point(x + width * 0.3, y + height),
                new Point(x, y + height)
            ),
            new Curve(
                new Point(x, y + height),
                new Point(x, y + height * 0.7),
                new Point(x, y + height * 0.3),
                new Point(x, y)
            )
        ];
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.curves.forEach(curve => curve.draw(ctx));
    }

    getCurves() {
        return this.curves;
    }
}
