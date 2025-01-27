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
        this.x = x;
        this.y = y;
        // Update all connected patches
        this.connectedPatches.forEach(conn => {
            conn.patch.updateKnotPosition(conn.row, conn.col, x, y);
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
