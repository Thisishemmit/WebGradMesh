import BezierPatch from './BezierPatch';
import KnotPoint from './KnotPoint';
import { Color } from './Point';

export default class PatchManager {
    private patches: BezierPatch[] = [];
    private knots: KnotPoint[] = [];
    private selectedKnot: KnotPoint | null = null;

    createPatchGrid(x: number, y: number, patchWidth: number, patchHeight: number) {
        const patches: BezierPatch[][] = Array(2).fill(null).map(() => Array(2));
        
        // Create four patches in a 2x2 grid
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                patches[row][col] = new BezierPatch(
                    x + col * patchWidth,
                    y + row * patchHeight,
                    patchWidth,
                    patchHeight
                );
                this.patches.push(patches[row][col]);
            }
        }

        // Define shared colors for knot points
        const cornerColors = {
            topLeft: { r: 255, g: 0, b: 0, a: 1 },
            topRight: { r: 0, g: 255, b: 0, a: 1 },
            bottomRight: { r: 0, g: 0, b: 255, a: 1 },
            bottomLeft: { r: 255, g: 255, b: 0, a: 1 },
            center: { r: 255, g: 255, b: 255, a: 1 }
        };

        // Create shared knot points with correct colors
        // Center knot (shared by all four patches)
        const centerKnot = new KnotPoint(x + patchWidth, y + patchHeight, cornerColors.center);
        centerKnot.addConnection(3, 3, patches[0][0]); // bottom-right of top-left patch
        centerKnot.addConnection(3, 0, patches[0][1]); // bottom-left of top-right patch
        centerKnot.addConnection(0, 3, patches[1][0]); // top-right of bottom-left patch
        centerKnot.addConnection(0, 0, patches[1][1]); // top-left of bottom-right patch

        // Horizontal middle knots
        const topMiddleKnot = new KnotPoint(x + patchWidth, y, cornerColors.topRight);
        topMiddleKnot.addConnection(0, 3, patches[0][0]); // right of top-left patch
        topMiddleKnot.addConnection(0, 0, patches[0][1]); // left of top-right patch

        const bottomMiddleKnot = new KnotPoint(x + patchWidth, y + patchHeight * 2, 
            cornerColors.bottomRight);
        bottomMiddleKnot.addConnection(3, 3, patches[1][0]); // right of bottom-left patch
        bottomMiddleKnot.addConnection(3, 0, patches[1][1]); // left of bottom-right patch

        // Vertical middle knots
        const leftMiddleKnot = new KnotPoint(x, y + patchHeight, cornerColors.bottomLeft);
        leftMiddleKnot.addConnection(3, 0, patches[0][0]); // bottom of top-left patch
        leftMiddleKnot.addConnection(0, 0, patches[1][0]); // top of bottom-left patch

        const rightMiddleKnot = new KnotPoint(x + patchWidth * 2, y + patchHeight, 
            cornerColors.bottomRight);
        rightMiddleKnot.addConnection(3, 3, patches[0][1]); // bottom of top-right patch
        rightMiddleKnot.addConnection(0, 3, patches[1][1]); // top of bottom-right patch

        this.knots.push(centerKnot, topMiddleKnot, bottomMiddleKnot, 
                       leftMiddleKnot, rightMiddleKnot);

        // Force initial color update
        this.knots.forEach(knot => {
            knot.setColor(knot.getColor());
        });

        return { patches, knots: this.knots };
    }

    render(ctx: CanvasRenderingContext2D) {
        this.patches.forEach(patch => patch.render(ctx));
    }

    handleMouseMove(x: number, y: number) {
        if (this.selectedKnot) {
            this.selectedKnot.setPosition(x, y);
            return;
        }
        this.patches.forEach(patch => patch.handleMouseMove(x, y));
    }

    handleMouseDown(x: number, y: number) {
        // Try to find a knot point first
        const knot = this.findNearestKnot(x, y);
        if (knot && knot.distance < 10) {
            // Handle knot point movement
            this.selectedKnot = knot.knot;
            return;
        }

        // If no knot was clicked, handle regular patch points
        this.patches.forEach(patch => patch.handleMouseDown(x, y));
    }

    handleMouseUp() {
        this.selectedKnot = null;
        this.patches.forEach(patch => patch.handleMouseUp());
    }

    private findNearestKnot(x: number, y: number): { knot: KnotPoint, distance: number } | null {
        let nearest = null;
        let minDistance = Infinity;

        this.knots.forEach(knot => {
            const pos = knot.getPosition();
            const distance = Math.sqrt(
                Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = { knot, distance };
            }
        });

        return nearest;
    }
}
