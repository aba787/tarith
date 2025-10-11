

// Navigation Arrow Control - ملف مشترك لجميع الصفحات
document.addEventListener('DOMContentLoaded', function() {
    const navArrow = document.getElementById('navArrow');
    const navDropdown = document.getElementById('navDropdown');

    if (navArrow && navDropdown) {
        // Toggle dropdown
        navArrow.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = this.classList.contains('active');
            
            // إغلاق جميع القوائم المنسدلة الأخرى أولاً
            closeAllDropdowns();
            
            // تبديل حالة السهم والقائمة
            if (!isActive) {
                this.classList.add('active');
                navDropdown.classList.add('active');
            } else {
                this.classList.remove('active');
                navDropdown.classList.remove('active');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!navArrow.contains(e.target) && !navDropdown.contains(e.target)) {
                closeAllDropdowns();
            }
        });

        // Prevent dropdown from closing when clicking inside it
        navDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Close dropdown when clicking on a link
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                closeAllDropdowns();
            });
        });

        // Close dropdown when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllDropdowns();
            }
        });
    }

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.99) 0%, rgba(20, 20, 20, 0.99) 100%)';
                header.style.backdropFilter = 'blur(25px)';
            } else {
                header.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)';
                header.style.backdropFilter = 'blur(20px)';
            }
        }
    });

    // Language toggle functionality
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', function(e) {
            e.preventDefault();
            // Add language switching logic here
            console.log('Language toggle clicked');
        });
    }

    // User menu toggle functionality
    const userMenuToggle = document.getElementById('userMenuToggle');
    if (userMenuToggle) {
        userMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            // Add user menu logic here
            console.log('User menu toggle clicked');
        });
    }

    // Initialize user menu
    initializeUserMenu();
});

// دالة لإغلاق جميع القوائم المنسدلة
function closeAllDropdowns() {
    const navArrow = document.getElementById('navArrow');
    const navDropdown = document.getElementById('navDropdown');
    const userMenu = document.getElementById('userMenu');
    
    if (navArrow) navArrow.classList.remove('active');
    if (navDropdown) navDropdown.classList.remove('active');
    if (userMenu) userMenu.classList.remove('active');
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
        
        const isActive = userMenu.classList.contains('active');
        
        // إغلاق القائمة الرئيسية أولاً
        closeAllDropdowns();
        
        // تبديل حالة قائمة المستخدم
        if (!isActive) {
            userMenu.classList.add('active');
        } else {
            userMenu.classList.remove('active');
        }
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

