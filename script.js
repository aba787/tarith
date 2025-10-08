document.addEventListener('DOMContentLoaded', function() {
    // Language toggle functionality
    initializeLanguageToggle();

    // Mobile navigation toggle and header scroll effects
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
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

    // Apply translations
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    elementsToTranslate.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });

    // Auto-translate common elements
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
}

// Initialize news loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Load news
    loadNews();
});