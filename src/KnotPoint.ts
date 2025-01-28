import { Color } from './Point';

export default class KnotPoint {
    private x: number;
    private y: number;
    private color: Color;
    private connectedPatches: { row: number, col: number, patch: any }[] = [];

    constructor(x: number, y: number, color: Color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    addConnection(row: number, col: number, patch: any) {
        this.connectedPatches.push({ row, col, patch });
    }

    setPosition(x: number, y: number) {
        // Calculate movement delta
        const deltaX = x - this.x;
        const deltaY = y - this.y;


        // Update knot position
        this.x = x;
        this.y = y;

        // Update all connected patches' control points
        this.connectedPatches.forEach(conn => {
            const patch = conn.patch;
            const row = conn.row;
            const col = conn.col;

            // Update the knot point position
            patch.updateKnotPosition(row, col, x, y);

            // Move adjacent control points based on which corner this is
            if (row === 0) { // Top edge
                patch.moveAdjacentControlPoint(row, col === 0 ? 1 : 2, deltaX , deltaY );
            }
            if (row === 3) { // Bottom edge
                patch.moveAdjacentControlPoint(row, col === 0 ? 1 : 2, deltaX , deltaY );
            }
            if (col === 0) { // Left edge
                patch.moveAdjacentControlPoint(row === 0 ? 1 : 2, col, deltaX , deltaY );
            }
            if (col === 3) { // Right edge
                patch.moveAdjacentControlPoint(row === 0 ? 1 : 2, col, deltaX , deltaY );
            }
        });
    }

    setColor(color: Color) {
        this.color = color;
        // Update all connected patches
        this.connectedPatches.forEach(conn => {
            conn.patch.updateKnotColor(conn.row, conn.col, color);
        });
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getColor() {
        return this.color;
    }
}
