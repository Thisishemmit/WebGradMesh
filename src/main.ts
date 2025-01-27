import BezierPatch from './BezierPatch';
import GradMesh from './MeshGrad';
import './style.css'

const grad = new GradMesh('GradMesh');

const ctx = grad.getContext();
const canvas = ctx.canvas;
// Create and render a patch in the center of the canvas (x, y, width, height)
const patch = new BezierPatch(canvas.width / 2 - 100, canvas.height / 2 - 100, 200, 200);

// Modify some control points
patch.moveControlPoint(1, 1, 150, 150);
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    patch.handleMouseMove(x, y);
    render(ctx); // Re-render the canvas
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    patch.handleMouseDown(x, y);
});

canvas.addEventListener('mouseup', () => {
    patch.handleMouseUp();
});
// Render in animation loop or on demand
function render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    patch.render(ctx);
}

render(ctx);
