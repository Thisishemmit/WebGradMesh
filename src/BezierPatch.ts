import Point, { Color } from "./Point";


export default class BezierPatch {
    private controlPoints: Point[][];
    private selectedPoint: { row: number, col: number } | null = null;
    private hoveredPoint: { row: number, col: number } | null = null;
    private isDragging: boolean = false;

    constructor(x: number, y: number, width: number, height: number) {
        this.controlPoints = [];
        this.initControlPoints(x, y, width, height);
    }

    private initControlPoints(x: number, y: number, width: number, height: number): void {
        // Initialize 4x4 grid
        this.controlPoints = Array(4).fill(null).map(() => Array(4));

        // Set corner points
        this.controlPoints[0][0] = new Point(x, y);                    // Top-left
        this.controlPoints[0][0].color = { r: 255, g: 0, b: 0, a: 1 }; // Red

        this.controlPoints[0][3] = new Point(x + width, y);           // Top-right
        this.controlPoints[0][3].color = { r: 0, g: 255, b: 0, a: 1 }; // Green

        this.controlPoints[3][3] = new Point(x + width, y + height);  // Bottom-right
        this.controlPoints[3][3].color = { r: 0, g: 0, b: 255, a: 1 }; // Blue

        this.controlPoints[3][0] = new Point(x, y + height);          // Bottom-left
        this.controlPoints[3][0].color = { r: 255, g: 255, b: 0, a: 1 }; // Yellow

        // Set edge control points with even spacing
        // Top edge
        this.controlPoints[0][1] = new Point(x + width * 0.33, y);
        this.controlPoints[0][2] = new Point(x + width * 0.67, y);

        // Right edge
        this.controlPoints[1][3] = new Point(x + width, y + height * 0.33);
        this.controlPoints[2][3] = new Point(x + width, y + height * 0.67);

        // Bottom edge
        this.controlPoints[3][1] = new Point(x + width * 0.33, y + height);
        this.controlPoints[3][2] = new Point(x + width * 0.67, y + height);

        // Left edge
        this.controlPoints[1][0] = new Point(x, y + height * 0.33);
        this.controlPoints[2][0] = new Point(x, y + height * 0.67);

        // Initialize edge point colors through interpolation
        this.initializeEdgeColors();

        // Calculate interior points
        this.calculateInteriorPoints();
    }

    private initializeEdgeColors(): void {
        // Top edge
        this.controlPoints[0][1].color = this.interpolateEdgeColor(
            this.controlPoints[0][0].color,
            this.controlPoints[0][3].color,
            0.33
        );
        this.controlPoints[0][2].color = this.interpolateEdgeColor(
            this.controlPoints[0][0].color,
            this.controlPoints[0][3].color,
            0.67
        );

        // Right edge
        this.controlPoints[1][3].color = this.interpolateEdgeColor(
            this.controlPoints[0][3].color,
            this.controlPoints[3][3].color,
            0.33
        );
        this.controlPoints[2][3].color = this.interpolateEdgeColor(
            this.controlPoints[0][3].color,
            this.controlPoints[3][3].color,
            0.67
        );

        // Bottom edge
        this.controlPoints[3][1].color = this.interpolateEdgeColor(
            this.controlPoints[3][0].color,
            this.controlPoints[3][3].color,
            0.33
        );
        this.controlPoints[3][2].color = this.interpolateEdgeColor(
            this.controlPoints[3][0].color,
            this.controlPoints[3][3].color,
            0.67
        );

        // Left edge
        this.controlPoints[1][0].color = this.interpolateEdgeColor(
            this.controlPoints[0][0].color,
            this.controlPoints[3][0].color,
            0.33
        );
        this.controlPoints[2][0].color = this.interpolateEdgeColor(
            this.controlPoints[0][0].color,
            this.controlPoints[3][0].color,
            0.67
        );
    }

    private calculateInteriorPoints(): void {
        for (let i = 1; i <= 2; i++) {
            for (let j = 1; j <= 2; j++) {
                const u = j / 3;
                const v = i / 3;

                // Linear interpolation along boundaries
                const leftPoint = this.controlPoints[i][0];
                const rightPoint = this.controlPoints[i][3];
                const horizontal = this.linearInterpolate(leftPoint, rightPoint, u);

                const topPoint = this.controlPoints[0][j];
                const bottomPoint = this.controlPoints[3][j];
                const vertical = this.linearInterpolate(topPoint, bottomPoint, v);

                // Bilinear interpolation of corners
                const corners = this.bilinearInterpolate(
                    this.controlPoints[0][0],
                    this.controlPoints[0][3],
                    this.controlPoints[3][3],
                    this.controlPoints[3][0],
                    u, v
                );

                // Coons patch formula
                this.controlPoints[i][j] = new Point(
                    horizontal.x + vertical.x - corners.x,
                    horizontal.y + vertical.y - corners.y
                );
            }
        }
    }

    private linearInterpolate(p0: Point, p1: Point, t: number): Point {
        return new Point(
            p0.x * (1 - t) + p1.x * t,
            p0.y * (1 - t) + p1.y * t
        );
    }

    private bilinearInterpolate(
        p00: Point, p10: Point, p11: Point, p01: Point,
        u: number, v: number
    ): Point {
        return new Point(
            (1 - u) * (1 - v) * p00.x + u * (1 - v) * p10.x +
            u * v * p11.x + (1 - u) * v * p01.x,

            (1 - u) * (1 - v) * p00.y + u * (1 - v) * p10.y +
            u * v * p11.y + (1 - u) * v * p01.y
        );
    }

    evaluatePoint(u: number, v: number): Point {
        u = Math.max(0, Math.min(1, u));
        v = Math.max(0, Math.min(1, v));

        // Get Bernstein coefficients for cubic Bézier curves
        const bu = this.getBernsteinCoefficients(u);
        const bv = this.getBernsteinCoefficients(v);

        // Evaluate the boundary curves using cubic Bézier
        const topCurve = new Point(0, 0);
        const bottomCurve = new Point(0, 0);
        const leftCurve = new Point(0, 0);
        const rightCurve = new Point(0, 0);

        // Calculate top and bottom curves
        for (let j = 0; j < 4; j++) {
            // Top boundary curve
            topCurve.x += this.controlPoints[0][j].x * bu[j];
            topCurve.y += this.controlPoints[0][j].y * bu[j];

            // Bottom boundary curve
            bottomCurve.x += this.controlPoints[3][j].x * bu[j];
            bottomCurve.y += this.controlPoints[3][j].y * bu[j];
        }

        // Calculate left and right curves
        for (let i = 0; i < 4; i++) {
            // Left boundary curve
            leftCurve.x += this.controlPoints[i][0].x * bv[i];
            leftCurve.y += this.controlPoints[i][0].y * bv[i];

            // Right boundary curve
            rightCurve.x += this.controlPoints[i][3].x * bv[i];
            rightCurve.y += this.controlPoints[i][3].y * bv[i];
        }

        // Bilinear interpolation of corners for the twist correction
        const bilinear = this.bilinearInterpolate(
            this.controlPoints[0][0],
            this.controlPoints[0][3],
            this.controlPoints[3][3],
            this.controlPoints[3][0],
            u, v
        );

        // Coons patch formula with cubic Bézier boundaries
        return new Point(
            topCurve.x * (1 - v) + bottomCurve.x * v +
            leftCurve.x * (1 - u) + rightCurve.x * u -
            bilinear.x,

            topCurve.y * (1 - v) + bottomCurve.y * v +
            leftCurve.y * (1 - u) + rightCurve.y * u -
            bilinear.y
        );
    }

    private getBernsteinCoefficients(t: number): number[] {
        const mt = 1 - t;
        return [
            mt * mt * mt,        // (1-t)³
            3 * t * mt * mt,     // 3t(1-t)²
            3 * t * t * mt,      // 3t²(1-t)
            t * t * t            // t³
        ];
    }

    evaluateColor(u: number, v: number): string {
        // Linear interpolation of colors along edges
        const topColor = this.interpolateEdgeColor(
            this.controlPoints[0][0].color,
            this.controlPoints[0][3].color,
            u
        );
        const bottomColor = this.interpolateEdgeColor(
            this.controlPoints[3][0].color,
            this.controlPoints[3][3].color,
            u
        );
        const finalColor = this.interpolateEdgeColor(topColor, bottomColor, v);

        return `rgba(${Math.round(finalColor.r)},${Math.round(finalColor.g)},${Math.round(finalColor.b)},${finalColor.a})`;
    }

    private interpolateEdgeColor(color1: Color, color2: Color, t: number): Color {
        return {
            r: color1.r * (1 - t) + color2.r * t,
            g: color1.g * (1 - t) + color2.g * t,
            b: color1.b * (1 - t) + color2.b * t,
            a: color1.a * (1 - t) + color2.a * t
        };
    }

    moveControlPoint(row: number, col: number, x: number, y: number): void {
        if (row !== 0 && row !== 3 && col !== 0 && col !== 3) {
            return;
        }

        this.controlPoints[row][col].x = x;
        this.controlPoints[row][col].y = y;
        this.calculateInteriorPoints();
    }

    getControlPoint(row: number, col: number): Point {
        return this.controlPoints[row][col];
    }

    handleMouseMove(x: number, y: number): void {
        if (this.isDragging && this.selectedPoint) {
            this.moveControlPoint(
                this.selectedPoint.row,
                this.selectedPoint.col,
                x, y
            );
            return;
        }

        const nearest = this.findNearestControlPoint(x, y);
        if (nearest && nearest.distance < 10) {
            this.hoveredPoint = {
                row: nearest.row,
                col: nearest.col
            };
        } else {
            this.hoveredPoint = null;
        }
    }

    handleMouseDown(x: number, y: number): void {
        const nearest = this.findNearestControlPoint(x, y);
        if (nearest && nearest.distance < 10) {
            if (nearest.row === 0 || nearest.row === 3 ||
                nearest.col === 0 || nearest.col === 3) {
                this.selectedPoint = {
                    row: nearest.row,
                    col: nearest.col
                };
                this.isDragging = true;
            }
        }
    }

    handleMouseUp(): void {
        this.isDragging = false;
        this.selectedPoint = null;
    }

    private findNearestControlPoint(x: number, y: number): {
        row: number,
        col: number,
        distance: number
    } | null {
        let nearest = null;
        let minDistance = Infinity;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i !== 0 && i !== 3 && j !== 0 && j !== 3) continue;

                const point = this.controlPoints[i][j];
                const distance = Math.sqrt(
                    Math.pow(point.x - x, 2) +
                    Math.pow(point.y - y, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = { row: i, col: j, distance };
                }
            }
        }

        return nearest;
    }

    render(ctx: CanvasRenderingContext2D, resolution: number = 20): void {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw each quad
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const u1 = i / resolution;
                const v1 = j / resolution;
                const u2 = (i + 1) / resolution;
                const v2 = (j + 1) / resolution;

                // Get the four corners of the quad
                const p1 = this.evaluatePoint(u1, v1);
                const p2 = this.evaluatePoint(u2, v1);
                const p3 = this.evaluatePoint(u2, v2);
                const p4 = this.evaluatePoint(u1, v2);

                // Get color for this quad
                const centerColor = this.evaluateColor((u1 + u2) / 2, (v1 + v2) / 2);

                // Draw the quad
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.closePath();

                // Fill and stroke with the same color
                ctx.fillStyle = centerColor;
                ctx.strokeStyle = centerColor;
                ctx.lineWidth = 1;  // Adjust this value if needed

                ctx.fill();
                ctx.stroke();  // This should help fill the gaps
            }
        }

        // Draw control points on top
        this.renderControlPoints(ctx);
    }

    private renderControlPoints(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const point = this.controlPoints[i][j];
                const isEdgePoint = i === 0 || i === 3 || j === 0 || j === 3;
                const isSelected = this.selectedPoint?.row === i &&
                    this.selectedPoint?.col === j;
                const isHovered = this.hoveredPoint?.row === i &&
                    this.hoveredPoint?.col === j;

                if (isEdgePoint) {
                    if (isSelected) {
                        ctx.fillStyle = 'red';
                        ctx.strokeStyle = 'white';
                    } else if (isHovered) {
                        ctx.fillStyle = 'yellow';
                        ctx.strokeStyle = 'black';
                    } else {
                        ctx.fillStyle = 'white';
                        ctx.strokeStyle = 'black';
                    }

                    ctx.beginPath();
                    ctx.arc(point.x, point.y, isSelected ? 6 : 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
}
