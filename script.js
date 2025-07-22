const API_URL = "https://suitmedia-backend.suitdev.com/api/ideas";

let currentPage = 1;
let pageSize = 10;
let sortOrder = '-published_at'; // Default sorting by newest

let lastScrollY = window.scrollY;
let header = document.getElementById("header");

window.addEventListener("scroll", function() {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    // Scroll down: hide header
    header.classList.add("header-hidden");
  } else {
    // Scroll up: show header
    header.classList.remove("header-hidden");
  }
  lastScrollY = currentScrollY;
});

// Parallax effect for banner
const banner = document.querySelector('.banner');
const bannerImg = document.getElementById('banner-img');
const bannerContent = document.querySelector('.banner-content');

function handleBannerParallax() {
  if (!banner) return;
  const scrollY = window.scrollY;
  if (bannerImg) {
    bannerImg.style.transform = `translateY(${scrollY * 0.4}px)`;
  }
  if (bannerContent) {
    bannerContent.style.transform = `translateY(calc(-50% + ${scrollY * 0.12}px))`;
  }
}
window.addEventListener('scroll', function() {
  window.requestAnimationFrame(handleBannerParallax);
});

// Function to load posts from API using GET method
function loadPosts(page) {
  fetch(`${API_URL}?page[number]=${page}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sortOrder}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const posts = data.data;
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = ''; // Clear previous posts

    if (posts && posts.length > 0) {
      posts.forEach(post => {
        const imageUrl = post.small_image 
                          ? `https://suitmedia-backend.suitdev.com${post.small_image}` 
                          : 'https://placehold.co/300x168/e0e0e0/ffffff?text=No+Image'; // Placeholder if image not found

        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
          <div class="post-card-header">
            <img src="${imageUrl}" alt="${post.title}" loading="lazy">
          </div>
          <div class="post-card-body">
            <h3>${post.title}</h3>
            <p class="post-date">${new Date(post.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p class="post-description">${post.description ? post.description.slice(0, 120) + '...' : ''}</p>
          </div>
        `;
        postContainer.appendChild(postCard);
      });
    } else {
      postContainer.innerHTML = '<p>Tidak ada postingan yang ditemukan.</p>';
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = '<p>Terjadi kesalahan saat memuat postingan. Silakan coba lagi nanti.</p>';
  });
}

// Handling sorting and pagination
document.getElementById('show-per-page').addEventListener('change', (e) => {
  pageSize = parseInt(e.target.value);
  currentPage = 1; // Reset ke halaman 1 saat ukuran halaman berubah
  loadPosts(currentPage);
});

document.getElementById('sort').addEventListener('change', (e) => {
  sortOrder = e.target.value;
  currentPage = 1; // Reset ke halaman 1 saat urutan sort berubah
  loadPosts(currentPage);
});

// Handle pagination button clicks
const paginationButtons = document.querySelectorAll('.pagination-btn');
paginationButtons.forEach(button => {
  button.addEventListener('click', function() {
    const page = parseInt(this.innerText);
    currentPage = page;
    loadPosts(page);
    updatePagination();
  });
});

// Update pagination UI based on the current page
function updatePagination() {
  const paginationBtns = document.querySelectorAll('.pagination-btn');
  paginationBtns.forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.innerText) === currentPage) {
      btn.classList.add('active');
    }
  });

  const prevBtn = document.querySelector('.pagination-arrow[disabled]');
  const nextBtn = document.querySelector('.pagination-arrow');

  if (currentPage === 1) {
    prevBtn.setAttribute('disabled', 'true');
  } else {
    prevBtn.removeAttribute('disabled');
  }

  if (currentPage === 4) {
    nextBtn.setAttribute('disabled', 'true');
  } else {
    nextBtn.removeAttribute('disabled');
  }
}

// Initial load of posts when the page loads
window.addEventListener('DOMContentLoaded', (event) => {
  loadPosts(currentPage); // Ensures page 1 loads
  updatePagination(); // Ensures pagination is updated on first load
});
