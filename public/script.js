
// Category Switching
document.addEventListener("DOMContentLoaded", async () => {
    // Category Switch
    const items = document.querySelectorAll(".categories button");

    items.forEach(item => {
    item.addEventListener("click", () => {
        items.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
    });
    });

    // Hamburger Menu
    const hamburgerBtn = document.querySelector(".hamburger-btn");
    const sideNav = document.querySelector(".side-nav");
    const blackBg = document.querySelector(".black-bg");
    const xBtn = document.querySelector(".X-btn");

    hamburgerBtn.addEventListener('click', () => {
        sideNav.style.display = "block";
        blackBg.style.display = "block";
    });

    xBtn.addEventListener('click', () => {
        sideNav.style.display = "none";
        blackBg.style.display = "none";
    });

    blackBg.addEventListener('click', () => {
        sideNav.style.display = "none";
        blackBg.style.display = "none";
    });

    let currentUser = null;
    const authBtn = document.querySelector('.acc-btn') || document.querySelector('.nav-acc');

    await checkAuth();

    async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (data.authenticated) {
            if (authBtn) {
                authBtn.textContent = 'PROFILE';
                authBtn.closest('a').href = '/profile';
            }
            const heroAccBtn = document.querySelector('.hero-acc-btn');
            if (heroAccBtn) {
                heroAccBtn.textContent = 'PROFILE';
                heroAccBtn.closest('a').href = '/profile';
            }
            currentUser = data;
        }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
    async function loadDrawings() {
        try {
            const response = await fetch('/api/drawings/public');
            let drawings = await response.json();

            displayDrawings(drawings);

        } catch (error) {
            console.error('Error loading drawings:', error);
            galleryGrid.innerHTML = '<p>Error loading drawings. Please try again later.</p>';
        }
    }

    function displayDrawings(drawings) {
        const drawGallery = document.getElementById('draw-gallery');

        drawGallery.innerHTML = drawings.map(drawing => `
            <div class="item" id="item">
                <img src="${drawing.imageData}">
                <div class="item-overlay">
                    <div class="overlay-btns">
                        <button class="overlay-btn" onclick="addToFavorite('${drawing._id}')" title="Add to Favorites"><i class="bx bx-heart"></i></button>
                        <button class="overlay-btn" onclick="downloadDrawing('${drawing._id}', '${drawing.title}')" title="Download"><i class="bx bx-download"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    window.downloadDrawing = (drawingId, title) => {
        try {
            fetch(`/api/drawings/${drawingId}`)
                .then(res => res.json())
                .then(drawing => {
                    const link = document.createElement('a');
                    link.href = drawing.imageData;
                    link.download = `${title || 'drawing'}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
        } catch (error) {
            alert('Error downloading drawing');
        }
    };

    window.addToFavorite = async (drawingId) => {
        if (!currentUser) {
            alert('Please sign in to add favorites');
            window.location.href = '/account';
            return;
        }

        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.userId,
                    drawingId
                })
            });

            if (response.ok) {
                alert('Added to favorites!');
            } else {
                const data = await response.json();
                alert(data.error || 'Could not add to favorites');
            }
        } catch (error) {
            alert('Error adding to favorites');
        }
    };
    loadDrawings();
});