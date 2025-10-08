document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }));

    // Statistics Animation
    function animateNumbers() {
      const numberElements = document.querySelectorAll('.stat-number');

      numberElements.forEach(element => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // Count duration in milliseconds
        const steps = 60; // Number of steps
        const stepValue = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += stepValue;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          element.textContent = Math.floor(current) + '+';
        }, duration / steps);

        element.classList.add('animated');
      });
    }

    // Intersection Observer for statistics animation
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateNumbers();
            observer.unobserve(entry.target); // Run animation only once
          }
        });
      }, { threshold: 0.5 });

      observer.observe(statsSection);
    }


    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#fff';
            header.style.backdropFilter = 'none';
        }
    });

    // Partners marquee functionality
    duplicatePartners();
});

// Duplicate partners to create a continuous scrolling effect
function duplicatePartners() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    if (marqueeTrack) {
        const originalItems = marqueeTrack.innerHTML;
        marqueeTrack.innerHTML = originalItems + originalItems;
    }
}

// News management functions
function loadMoreNews() {
    // This function will load more news items
    // For now, it just shows an alert
    alert('سيتم تحميل المزيد من الأخبار');
}

// Load news from localStorage or database
function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    
    // Get news from localStorage (this will be populated by admin from members page)
    const savedNews = JSON.parse(localStorage.getItem('warithNews') || '[]');
    
    if (savedNews.length > 0) {
        newsGrid.innerHTML = '';
        savedNews.slice(0, 6).forEach(news => { // Show only first 6 news items
            const newsItem = createNewsItem(news);
            newsGrid.appendChild(newsItem);
        });
    }
}

// Create news item HTML element
function createNewsItem(news) {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
        <div class="news-date">${news.date}</div>
        <h3>${news.title}</h3>
        <p>${news.summary}</p>
        <a href="#" class="read-more">اقرأ المزيد</a>
    `;
    return newsItem;
}

// Initialize news loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Load news
    loadNews();
});