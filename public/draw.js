const drawingState = {
    currentUser: null
};

const authBtn = document.getElementById('auth-btn') || document.querySelector('a[href*="profile"]') || document.querySelector('a[href*="account"]');

async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (data.authenticated) {
            drawingState.currentUser = data;
            if (authBtn) {
                authBtn.textContent = 'Profile';
                authBtn.href = 'profile.html';
            }
        } else {
            console.log('User not authenticated');
        }
    } catch (error) {
        console.error('Authentication check error:', error);
    }
}

function requireAuth() {
    if (!drawingState.currentUser) {
        alert('Please sign in to perform this action');
        window.location.href = '/account';
        return false;
    }
    return true;
}

// Canvas Setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let erasing = false;

// Drawing Logic
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

// Draw on mouse move
canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    if (erasing) {
        ctx.lineWidth = eraserSize;
    } else {
        ctx.lineWidth = penSize;
    }

    ctx.lineCap = "round";

    if (erasing) {
        ctx.strokeStyle = "white";
    } else {
        ctx.strokeStyle = penColor;
    }

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

// Stop drawing on mouse up
canvas.addEventListener("mouseup", () => {
    stopDrawing();
});

// Stop drawing when mouse leaves canvas
canvas.addEventListener("mouseleave", () => {
    stopDrawing();
});

// Stop drawing function
function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

// Tools Buttons
const penBtn = document.getElementById("pen");
const eraserBtn = document.getElementById("eraser");
const toolButtons = document.querySelectorAll(".tool-btns button");

toolButtons.forEach(button => {
  button.addEventListener("click", () => {
    toolButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });
});
penBtn.addEventListener("click", () => {
    erasing = false;
});

eraserBtn.addEventListener("click", () => {
    erasing = true;
});

// Color and Brush Size
const colorBtn = document.getElementById("color-btn");
const colorInput = document.getElementById("curr-color");
const sizeValue = document.getElementById("size-value");
const brushRange = document.getElementById("brush-range");
const brushNum = document.getElementById("brush-num");

let penColor = "#000000";
let penSize = 3;
let eraserSize = 3;

colorBtn.addEventListener("click", () => {
    colorInput.click();
});

colorInput.addEventListener("input", (e) => {
    penColor = e.target.value;
    colorBtn.style.backgroundColor = e.target.value;
});

brushRange.addEventListener("input", (e) => {
    brushSize(e);
});

brushNum.addEventListener("input", (e) => {
    brushSize(e);
});

function brushSize(e) {
    const size = Number(e.target.value);
    sizeValue.textContent = size + "px";
    penSize = size;
    eraserSize = size;
    brushRange.value = size;
    brushNum.value = size;
}

// Action Buttons
const clearBtn = document.getElementById("clear");
const downBtn = document.getElementById("download");
const saveBtn = document.getElementById("save");
const favBtn = document.getElementById("favorite");
const postBtn = document.getElementById("post");

// Clear Canvas
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Download Drawing
downBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
    alert("Downloaded");
});

// Save Drawing
saveBtn.addEventListener("click", saveDrawing);

async function saveDrawing() {
    if (!requireAuth()) return;

    const imageData = canvas.toDataURL();

    try {
        const response = await fetch('/api/drawings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: drawingState.currentUser.userId,
                imageData,
                isPublic: false
            })
        });

        if (response.ok) {
            alert('Drawing saved!');
        } else {
            alert('Error');
        }
    } catch (error) {
        alert('Error');
    }
}

// Favorite Drawing
favBtn.addEventListener("click", favoriteDrawing);

async function favoriteDrawing() {
    if (!requireAuth()) return;

    const imageData = canvas.toDataURL();

    try {
        const saveResponse = await fetch('/api/drawings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: drawingState.currentUser.userId,
                imageData,
                isPublic: false
            })
        });
        const drawing = await saveResponse.json();

        const favResponse = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: drawingState.currentUser.userId,
                drawingId: drawing._id
            })
        });

        if (favResponse.ok) {
            alert('Drawing added to Favorites!');
        } else {
            alert('Error');
        }
    } catch (error) {
        alert('Error');
    }
}

// Post Drawing
postBtn.addEventListener("click", postDrawing);

async function postDrawing() {
    if (!requireAuth()) return;

    const imageData = canvas.toDataURL();

    try {
        const response = await fetch('/api/drawings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: drawingState.currentUser.userId,
                imageData,
                isPublic: true
            })
        });

        if (response.ok) {
            alert('Drawing Posted!');
        } else {
            alert('Error');
        }
    } catch (error) {
        alert('Error');
    }
}

// Responsive Canvas
function resizeCanvas() {
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    temp.getContext("2d").drawImage(canvas, 0, 0);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.drawImage(temp, 0, 0);
}

// Initial resize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Initialize authentication check
checkAuthentication();
