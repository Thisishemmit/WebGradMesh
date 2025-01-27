import GradMesh from './MeshGrad';
import PatchManager from './PatchManager';
import './style.css'

const grad = new GradMesh('GradMesh');
const ctx = grad.getContext();
const canvas = ctx.canvas;

const patchManager = new PatchManager();

// Create a 2x2 grid of patches in the center of the canvas
const { patches } = patchManager.createPatchGrid(
    canvas.width / 3 - 100,
    canvas.height / 3 - 100,
    200,
    200
);

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    patchManager.handleMouseMove(x, y);
    render(ctx);
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    patchManager.handleMouseDown(x, y);
});

canvas.addEventListener('mouseup', () => {
    patchManager.handleMouseUp();
});

function render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    patchManager.render(ctx);
}

render(ctx);