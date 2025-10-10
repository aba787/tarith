document.addEventListener('DOMContentLoaded', function() {
    // Language toggle functionality
    initializeLanguageToggle();

    // Mobile navigation toggle and header scroll effects
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Header scroll effect
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;

        if (header) {
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        lastScrollY = currentScrollY;
    });

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navigationLinks = document.querySelectorAll('.nav-link[href^="#"]');

    function setActiveNav() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navigationLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', setActiveNav);
    setActiveNav(); // Call once on load


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

    // Initialize news loading when page loads
    loadNews();

    // Initialize news slider
    initializeNewsSlider();

    // Initialize user menu
    initializeUserMenu();
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

    const imageSection = news.image ?
        `<div class="news-image">
            <img src="${news.image}" alt="${news.title}" loading="lazy">
         </div>` :
        `<div class="news-image">
            <img src="https://via.placeholder.com/400x250/8B4513/F5F5DC?text=${encodeURIComponent(news.title)}" alt="${news.title}" loading="lazy">
         </div>`;

    newsItem.innerHTML = `
        ${imageSection}
        <div class="news-content">
            <div class="news-date">${news.date}</div>
            <h3>${news.title}</h3>
            <p>${news.summary}</p>
            <a href="#" class="read-more">اقرأ المزيد</a>
        </div>
    `;
    return newsItem;
}

// Language toggle functions
function initializeLanguageToggle() {
    const languageToggle = document.getElementById('languageToggle');
    if (!languageToggle) return;

    // Check saved language preference
    const savedLanguage = localStorage.getItem('siteLanguage') || 'ar';
    setLanguage(savedLanguage);

    languageToggle.addEventListener('click', function() {
        const currentLang = document.body.classList.contains('english') ? 'en' : 'ar';
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
        localStorage.setItem('siteLanguage', newLang);
    });
}

function setLanguage(language) {
    const body = document.body;
    const languageToggle = document.getElementById('languageToggle');

    if (language === 'en') {
        body.classList.add('english');
        body.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
        if (languageToggle) languageToggle.textContent = 'العربية';
        translateContent('en');
    } else {
        body.classList.remove('english');
        body.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        if (languageToggle) languageToggle.textContent = 'English';
        translateContent('ar');
    }
}

function translateContent(language) {
    const translations = {
        ar: {
            // Navigation
            'الرئيسية': 'الرئيسية',
            'من نحن': 'من نحن',
            'رسالتنا': 'رسالتنا',
            'الهيكل التنظيمي': 'الهيكل التنظيمي',
            'البرامج': 'البرامج',
            'التكريمات والجوائز': 'التكريمات والجوائز',
            'شركاؤنا': 'شركاؤنا',
            'المقالات': 'المقالات',
            'الأعضاء': 'الأعضاء',
            'تواصل معنا': 'تواصل معنا',
            'انضم إلينا': 'انضم إلينا',

            // Hero section
            'حياكم الله في وريث': 'حياكم الله في وريث',
            'إرثٌ باقٍ و تقاليدُ حية': 'إرثٌ باقٍ و تقاليدُ حية',
            'ابدأ الآن': 'ابدأ الآن'
        },
        en: {
            // Navigation
            'الرئيسية': 'Home',
            'من نحن': 'About Us',
            'رسالتنا': 'Our Mission',
            'الهيكل التنظيمي': 'Organization',
            'البرامج': 'Programs',
            'التكريمات والجوائز': 'Awards & Recognition',
            'شركاؤنا': 'Our Partners',
            'المقالات': 'Articles',
            'الأعضاء': 'Members',
            'تواصل معنا': 'Contact Us',
            'انضم إلينا': 'Join Us',

            // Hero section
            'حياكم الله في وريث': 'Welcome to Wareeth',
            'إرثٌ باقٍ و تقاليدُ حية': 'Living Heritage & Lasting Traditions',
            'ابدأ الآن': 'Get Started'
        }
    };

    // Auto-translate navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const text = link.textContent.trim();
        if (translations[language] && translations[language][text]) {
            link.textContent = translations[language][text];
        }
    });

    // Hero content
    const heroTitle = document.querySelector('.hero-content h1');
    const heroSubtitle = document.querySelector('.hero-content p');
    const ctaButton = document.querySelector('.cta-button');

    if (heroTitle && translations[language][heroTitle.textContent.trim()]) {
        heroTitle.textContent = translations[language][heroTitle.textContent.trim()];
    }
    if (heroSubtitle && translations[language][heroSubtitle.textContent.trim()]) {
        heroSubtitle.textContent = translations[language][heroSubtitle.textContent.trim()];
    }
    if (ctaButton && translations[language][ctaButton.textContent.trim()]) {
        ctaButton.textContent = translations[language][ctaButton.textContent.trim()];
    }

    // Section headings
    const sectionHeadings = document.querySelectorAll('h2, h3');
    sectionHeadings.forEach(heading => {
        const text = heading.textContent.trim();
        if (translations[language] && translations[language][text]) {
            heading.textContent = translations[language][text];
        }
    });
}

// News Slider Functionality
let currentNewsSlide = 0;
let totalNewsSlides = 0;

function initializeNewsSlider() {
    const newsTrack = document.getElementById('newsTrack');
    const prevBtn = document.getElementById('prevNewsBtn');
    const nextBtn = document.getElementById('nextNewsBtn');
    const indicatorsContainer = document.getElementById('newsIndicators');

    if (!newsTrack) return;

    // Count total slides
    const slides = newsTrack.querySelectorAll('.news-slide');
    totalNewsSlides = slides.length;

    // Create indicators
    createNewsIndicators(indicatorsContainer);

    // Event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentNewsSlide > 0) {
                currentNewsSlide--;
                updateNewsSlider();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentNewsSlide < totalNewsSlides - 1) {
                currentNewsSlide++;
                updateNewsSlider();
            }
        });
    }

    // Auto-slide functionality (optional)
    startNewsAutoSlide();

    // Touch/swipe support for mobile
    addSwipeSupport(newsTrack);

    // Initial update
    updateNewsSlider();
}

function createNewsIndicators(container) {
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < totalNewsSlides; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'news-indicator';
        indicator.addEventListener('click', () => {
            currentNewsSlide = i;
            updateNewsSlider();
        });
        container.appendChild(indicator);
    }
}

function updateNewsSlider() {
    const newsTrack = document.getElementById('newsTrack');
    const prevBtn = document.getElementById('prevNewsBtn');
    const nextBtn = document.getElementById('nextNewsBtn');
    const indicators = document.querySelectorAll('.news-indicator');

    if (!newsTrack) return;

    // Move the track
    const translateX = -currentNewsSlide * 100;
    newsTrack.style.transform = `translateX(${translateX}%)`;

    // Update button states
    if (prevBtn) {
        prevBtn.disabled = currentNewsSlide === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentNewsSlide === totalNewsSlides - 1;
    }

    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentNewsSlide);
    });
}

function startNewsAutoSlide() {
    const autoSlideInterval = 5000; // 5 seconds

    setInterval(() => {
        if (currentNewsSlide < totalNewsSlides - 1) {
            currentNewsSlide++;
        } else {
            currentNewsSlide = 0;
        }
        updateNewsSlider();
    }, autoSlideInterval);
}

function addSwipeSupport(element) {
    let startX = 0;
    let endX = 0;

    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    element.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentNewsSlide < totalNewsSlides - 1) {
                // Swipe left - next slide
                currentNewsSlide++;
                updateNewsSlider();
            } else if (diff < 0 && currentNewsSlide > 0) {
                // Swipe right - previous slide
                currentNewsSlide--;
                updateNewsSlider();
            }
        }
    }
}

// User Menu Functionality
function initializeUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!userMenuToggle) return;

    // Toggle user menu dropdown
    userMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });

    // Close user menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });

    // Handle logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Add logout logic here
            if (confirm('هل تريد تسجيل الخروج؟')) {
                // Clear any stored user data
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('currentUser');

                // Show logout message
                alert('تم تسجيل الخروج بنجاح');

                // Close dropdown
                userMenu.classList.remove('active');

                // Redirect to home page or reload
                window.location.href = 'index.html';
            }
        });
    }

    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            userMenu.classList.remove('active');
        }
    });
}