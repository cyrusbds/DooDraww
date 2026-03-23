document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.querySelector('.logout-btn');
  const logoutNav = document.querySelector('.logout-nav');
  const drawingModal = document.getElementById('drawingModal');
  const removeBtn = document.querySelector('.remove-fav');
  const profileFavorite = document.getElementById('profile-favorites');
  const profileDrawing = document.getElementById('profile-drawings');

  let currentUser = null;      
  let currentDrawingId = null;

  await checkAuth();

  logoutBtn?.addEventListener('click', logOut);
  logoutNav?.addEventListener('click', logOut);

  const tabBtns = document.querySelectorAll('.profile-tabs button');
  const tabCont = document.querySelectorAll('.profile-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabCont.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

      if (targetTab === 'profile-favorites') {
        loadFavorites();
      } else if (targetTab === 'profile-drawings') {
        loadUserDrawings();
      }
    });
  });

  async function logOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (!data.authenticated) {
        window.location.href = '/';
        return;
      }

      currentUser = data;
      await loadUserProfile();
      await loadUserDrawings();
      await loadFavorites();
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  async function loadUserProfile() {
    try {
      const response = await fetch(`/api/users/${currentUser.userId}`);
      const user = await response.json();

      const userDisplay = document.getElementById('user-display');
      const emailDisplay = document.getElementById('email-display');

      userDisplay.textContent = user.name;
      emailDisplay.textContent = user.email;

      const firstLetter = user.name?.charAt(0).toUpperCase() || 'U';
      
      document.getElementById('profile-dp').textContent = firstLetter;

      } catch (error) {
        console.error('Error loading profile:', error);
      }
  }

  async function loadUserDrawings() {
    try {
      const response = await fetch(`/api/drawings/user/${currentUser.userId}`);
      const drawings = await response.json();
      
      const saved = drawings.length;
      const posts = drawings.filter(d => d.isPublic).length;

      const saveCount = document.getElementById('saves');
      const postCount = document.getElementById('posts');

      saveCount.textContent = saved;
      postCount.textContent = posts;

      displayDrawings(drawings);
    } catch (error) {
      console.error('Error loading drawings:', error);
    }
  }

  async function loadFavorites() {
    try {
      const response = await fetch(`/api/favorites/${currentUser.userId}`);
      const favorites = await response.json();

      const favCount = document.getElementById('favs');

      favCount.textContent = favorites.length;
      
      displayFavorites(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  function displayDrawings(drawings) {
    profileDrawing.innerHTML = drawings.map(drawing => `
      <div class="item" data-id="${drawing._id}">
        <img src="${drawing.imageData}">
        <div class="item-overlay">
          <div class="overlay-btns">
            <button class="overlay-btn" onclick="downloadDrawing('${drawing._id}', '${drawing.title}')" title="Download"><i class="bx bx-download"></i></button>
            <button class="overlay-btn" onclick="addToFavorite('${drawing._id}')" title="Add to Favorites"><i class="bx bx-heart"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  function displayFavorites(favorites) {
    profileFavorite.innerHTML = favorites.map(drawing => `
      <div class="item" id="${drawing._id}" data-id="${drawing._id}">
        <img src="${drawing.imageData}">
        <div class="item-overlay">
          <div class="overlay-btns">
            <button class="overlay-btn" onclick="downloadDrawing('${drawing._id}', '${drawing.title}')" title="Download"><i class="bx bx-download"></i></button>
            <button class="overlay-btn" onclick="removeFavorite('${drawing._id}')" title="Remove from Favorites"><i class="bx bx-x"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }

  profileDrawing.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (item) return;
    currentDrawingId = item.dataset.id;
    drawingModal.classList.add('active');
  });
  
  window.removeFavorite = async (drawingId) => {
    try {
      const response = await fetch(`/api/favorites/${currentUser.userId}/${drawingId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
      document.querySelector(`.item[data-id="${drawingId}"]`)?.remove();
    } else {
      const data = await response.json();
      alert(data.error || 'Error removing from favorites');
    }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing from favorites');
    }
  };

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
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.userId,
          drawingId: drawingId
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
});

