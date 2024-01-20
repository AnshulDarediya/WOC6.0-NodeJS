document.addEventListener('DOMContentLoaded', function () {
    // const socket = io();


    

    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Drawing tools variables
    let brushSize = 'medium';
    let brushColor = '#000000';
    let eraserMode = false;

    // Variables for smoother drawing
    let animationFrameId;
    let points = [];

    // Mouse event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch event listeners for mobile devices
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // Brush size selector
    const brushSizeSelect = document.getElementById('brush-size');
    brushSizeSelect.addEventListener('input', function () {
        brushSize = this.value;
        console.log(`Brush Size: ${brushSize}`);
    });

    // Brush color selector
    const brushColorInput = document.getElementById('brush-color');
    brushColorInput.addEventListener('input', function () {
        brushColor = this.value;
        eraserMode = false; // Ensure eraser mode is turned off when changing color
    });

    // Eraser button
    const eraserButton = document.getElementById('eraser');
    eraserButton.addEventListener('click', function () {
        if (eraserMode) {
            eraserMode = false;
            brushColor = brushColorInput.value; // Switch back to the regular brush color
        } else {
            eraserMode = true;
            brushColor = '#ffffff'; // White color for eraser
            clearCanvas(); // Clear the entire canvas when eraser is activated
        }
    });

    // Clear canvas button
    const clearButton = document.getElementById('clear-canvas');
    clearButton.addEventListener('click', clearCanvas);

    function startDrawing(e) {
        drawing = true;
        points = []; // Start a new set of points for a new path
        draw(e);
    }

    function draw(e) {
        if (!drawing) return;

        points.push(e);

        animationFrameId = requestAnimationFrame(animateDrawing);
    }

    function animateDrawing() {
        ctx.lineWidth = getBrushSize();
        ctx.lineCap = 'round';
        ctx.strokeStyle = brushColor;

        if (points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].clientX - canvas.offsetLeft, points[0].clientY - canvas.offsetTop);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].clientX - canvas.offsetLeft, points[i].clientY - canvas.offsetTop);
        }

        ctx.stroke();

        points = [points[points.length - 1]]; // Keep the last point for the next frame
    }

    function stopDrawing() {
        drawing = false;
        cancelAnimationFrame(animationFrameId);
        ctx.closePath();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Reset the brush color to the selected color
        brushColor = brushColorInput.value;
    }

    function getBrushSize() {
        switch (brushSize) {
            case 'small':
                return 5;
            case 'medium':
                return 10;
            case 'large':
                return 15;
            default:
                return 10;
        }
    }

    
});

// client.js


