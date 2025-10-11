

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
        // تحديد اللغة المحفوظة أو الافتراضية
        const savedLanguage = localStorage.getItem('siteLanguage') || 'ar';
        setLanguage(savedLanguage);

        languageToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const currentLang = document.body.classList.contains('english') ? 'en' : 'ar';
            const newLang = currentLang === 'ar' ? 'en' : 'ar';
            setLanguage(newLang);
            localStorage.setItem('siteLanguage', newLang);
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

// Language switching functions
function setLanguage(language) {
    const body = document.body;
    const languageToggle = document.getElementById('languageToggle');

    if (language === 'en') {
        body.classList.add('english');
        body.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
        if (languageToggle) {
            languageToggle.innerHTML = '<i class="fas fa-globe"></i> العربية';
        }
        translateContent('en');
    } else {
        body.classList.remove('english');
        body.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        if (languageToggle) {
            languageToggle.innerHTML = '<i class="fas fa-globe"></i> EN';
        }
        translateContent('ar');
    }
}

function translateContent(language) {
    const translations = {
        en: {
            // Navigation
            'الرئيسية': 'Home',
            'من نحن': 'About Us',
            'البرامج': 'Programs',
            'الهيكل التنظيمي': 'Organization',
            'التكريمات والجوائز': 'Awards & Recognition',
            'شركاؤنا': 'Our Partners',
            'المقالات': 'Articles',
            'الأعضاء': 'Members',
            'تواصل معنا': 'Contact Us',
            'انضم إلينا': 'Join Us',
            'حسابي': 'My Account',

            // Hero section
            'حياكم الله في وريث': 'Welcome to Wareeth',
            'إرث باقٍ وتاريخ حي': 'Living Heritage & Lasting History',

            // About section
            'وريث': 'Wareeth',
            'الرؤية': 'Vision',
            'الرسالة': 'Mission',
            'أن نكون الفريق الرائد في توثيق وحفظ التراث السعودي ونشره للأجيال القادمة بأساليب عصرية ومبتكرة': 'To be the leading team in documenting and preserving Saudi heritage and spreading it to future generations through modern and innovative methods',
            'الهدف الرئيسي والغاية من إنشاء الفريق': 'The main goal and purpose of establishing the team',
            'نعمل على توثيق التراث السعودي ونشره': 'We work to document and spread Saudi heritage',
            'انطلقت مسيرة فريقنا منذ عام 2021 م ولا تزال مستمرة إلى اليوم': 'Our team\'s journey began in 2021 and continues to this day',
            'تهدف إلى تعزيز الهوية السعودية والمساهمة في تسجيل الإرث وإعادة إحياء العادات والتقاليد': 'Aims to strengthen Saudi identity and contribute to recording heritage and reviving customs and traditions',

            // News section
            'الأخبار والإعلانات': 'News & Announcements',
            'إطلاق مبادرة جديدة لحفظ التراث': 'Launch of New Heritage Preservation Initiative',
            'ورشة عمل الحرف اليدوية التقليدية': 'Traditional Handicrafts Workshop',
            'تكريم المتطوعين المميزين': 'Honoring Outstanding Volunteers',
            'فعالية تراثية كبرى بالرياض': 'Major Heritage Event in Riyadh',
            'شراكة استراتيجية مع وزارة الثقافة': 'Strategic Partnership with Ministry of Culture',
            'اقرأ المزيد': 'Read More',
            'عرض جميع الأخبار': 'View All News',

            // Statistics
            'إحصائيات فريق وريث': 'Wareeth Team Statistics',
            'إجمالي ساعات التطوع': 'Total Volunteer Hours',
            'عدد المتطوعين': 'Number of Volunteers',
            'عدد الأماكن': 'Number of Places',
            'المستفيدون من البرامج والمساهمات': 'Program Beneficiaries',

            // Partners
            'شركاؤنا والداعمون': 'Our Partners & Supporters',
            'وزارة الثقافة': 'Ministry of Culture',
            'الهيئة العامة للتراث': 'Heritage Authority',
            'مؤسسة محمد بن سلمان': 'Mohammed bin Salman Foundation',
            'نادي الرياض': 'Riyadh Club',
            'جمعية وطن طموح': 'Watan Ambitious Association',
            'مجتمع حرفة': 'Hirfa Community',

            // Join section
            'انضم إلى فريق وريث التطوعي': 'Join Wareeth Volunteer Team',
            'كن جزءاً من رحلتنا في حفظ التراث ونشر الثقافة العربية الأصيلة': 'Be part of our journey in preserving heritage and spreading authentic Arab culture',
            'الانضمام للفريق': 'Join the Team',

            // Footer
            'معلومات الاتصال': 'Contact Information',
            'روابط مفيدة': 'Useful Links',
            'تابعنا على وسائل التواصل الاجتماعي': 'Follow us on social media',
            'سياسة الخصوصية': 'Privacy Policy',
            'شروط الاستخدام': 'Terms of Use',
            'الدعم الفني': 'Technical Support',
            'جميع الحقوق محفوظة - وريث': 'All rights reserved - Wareeth',

            // Programs page
            'برامج فريق وريث': 'Wareeth Team Programs',
            'إرثنا وتقاليد حية': 'Our Heritage & Living Traditions',
            'نعمل من خلال برامجنا المتنوعة على حفظ التراث ونشره بأساليب عصرية ومبتكرة': 'Through our diverse programs, we work to preserve and spread heritage using modern and innovative methods',
            'إعداد المحتوى الرقمي والمسموع': 'Digital & Audio Content Creation',
            'جلسة وريث': 'Wareeth Sessions',
            'رعاية التكنولوجيا': 'Technology Sponsorship',
            'انضم إلى برامجنا': 'Join Our Programs',
            'انضم كمتطوع': 'Join as Volunteer',

            // Organization page
            'الهيكل التنظيمي': 'Organizational Structure',
            'تنظيم العمل في فريق وريث': 'Work Organization in Wareeth Team',
            'قسم التوثيق': 'Documentation Department',
            'قسم الأبحاث': 'Research Department',
            'قسم الفعاليات': 'Events Department',
            'قسم التطوع': 'Volunteer Department',
            'التعاون بين الأقسام': 'Cooperation Between Departments',
            'انضم إلى أحد أقسامنا': 'Join One of Our Departments',

            // Awards page
            'التكريمات والجوائز': 'Awards & Recognition',
            'فخر وريث بالإنجازات والتقديرات التي حصل عليها الفريق في مسيرته التطوعية': 'Wareeth\'s pride in the achievements and recognitions the team has received in its volunteer journey',
            'التكريمات': 'Recognitions',
            'جوائز ومبادرات': 'Awards & Initiatives',
            'مشاركات مميزة': 'Distinguished Participations',
            'إنجازاتنا بالأرقام': 'Our Achievements in Numbers',

            // Articles page
            'مقالات وريث': 'Wareeth Articles',
            'المقالات المنشورة': 'Published Articles',
            'الكل': 'All',
            'التراث والثقافة': 'Heritage & Culture',
            'التقنية والابتكار': 'Technology & Innovation',
            'الحرف اليدوية': 'Handicrafts',
            'التاريخ': 'History',
            'المجتمع والتطوع': 'Society & Volunteering',

            // Contact page
            'تواصل معنا': 'Contact Us',
            'نحن هنا للاستماع إليكم والإجابة على جميع استفساراتكم': 'We are here to listen to you and answer all your inquiries',
            'البريد الإلكتروني': 'Email',
            'الهاتف': 'Phone',
            'العنوان': 'Address',
            'أوقات العمل': 'Working Hours',
            'الرياض، المملكة العربية السعودية': 'Riyadh, Saudi Arabia',
            'الأحد - الخميس': 'Sunday - Thursday',
            'أرسل لنا رسالة': 'Send us a message',
            'سنكون سعداء للتواصل معك والإجابة على جميع استفساراتك': 'We will be happy to communicate with you and answer all your inquiries',
            'الاسم الأول': 'First Name',
            'الاسم الأخير': 'Last Name',
            'رقم الهاتف': 'Phone Number',
            'الموضوع': 'Subject',
            'الرسالة': 'Message',
            'إرسال الرسالة': 'Send Message',
            'الأسئلة الشائعة': 'FAQ',

            // Join page
            'انضم إلى فريق وريث': 'Join Wareeth Team',
            'الانضمام إلى الفريق التطوعي': 'Join the Volunteer Team',
            'يرجى تسجيل معلوماتك لتقديم طلب الانضمام. سيتم مراجعة طلبك من قبل فريق وريث التطوعي.': 'Please register your information to submit a membership application. Your application will be reviewed by the Wareeth volunteer team.',
            'الاسم الكامل': 'Full Name',
            'رسالة مختصرة (اختياري)': 'Brief Message (Optional)',
            'إرسال الطلب': 'Send Application',
            'مميزات الانضمام لفريق وريث': 'Benefits of Joining Wareeth Team',
            'المشاركة في البرامج': 'Participate in Programs',
            'نشر المقالات': 'Publish Articles',
            'الشبكة التراثية': 'Heritage Network',
            'التطوير المهني': 'Professional Development',
            'خطوات عملية الانضمام': 'Membership Process Steps',

            // Members page
            'إدارة الأعضاء': 'Members Management',
            'تسجيل الدخول': 'Login',
            'قم بتسجيل الدخول للوصول إلى لوحة إدارة الأعضاء': 'Login to access the members management panel',
            'اسم المستخدم': 'Username',
            'كلمة المرور': 'Password',
            'لوحة إدارة الأعضاء': 'Members Management Dashboard',
            'مرحباً': 'Welcome',
            'تسجيل الخروج': 'Logout',
            'إجمالي الأعضاء': 'Total Members',
            'الأعضاء النشطين': 'Active Members',
            'المقالات المنشورة': 'Published Articles',
            'مقالات في الانتظار': 'Pending Articles'
        },
        ar: {
            // English to Arabic translations
            'Home': 'الرئيسية',
            'About Us': 'من نحن',
            'Programs': 'البرامج',
            'Organization': 'الهيكل التنظيمي',
            'Awards & Recognition': 'التكريمات والجوائز',
            'Our Partners': 'شركاؤنا',
            'Articles': 'المقالات',
            'Members': 'الأعضاء',
            'Contact Us': 'تواصل معنا',
            'Join Us': 'انضم إلينا',
            'My Account': 'حسابي',

            'Welcome to Wareeth': 'حياكم الله في وريث',
            'Living Heritage & Lasting History': 'إرث باقٍ وتاريخ حي',

            'Wareeth': 'وريث',
            'Vision': 'الرؤية',
            'Mission': 'الرسالة',

            'News & Announcements': 'الأخبار والإعلانات',
            'Read More': 'اقرأ المزيد',
            'View All News': 'عرض جميع الأخبار',

            'Wareeth Team Statistics': 'إحصائيات فريق وريث',
            'Total Volunteer Hours': 'إجمالي ساعات التطوع',
            'Number of Volunteers': 'عدد المتطوعين',
            'Number of Places': 'عدد الأماكن',
            'Program Beneficiaries': 'المستفيدون من البرامج والمساهمات',

            'Our Partners & Supporters': 'شركاؤنا والداعمون',
            'Join Wareeth Volunteer Team': 'انضم إلى فريق وريث التطوعي',
            'Join the Team': 'الانضمام للفريق',

            'Contact Information': 'معلومات الاتصال',
            'Useful Links': 'روابط مفيدة',
            'Follow us on social media': 'تابعنا على وسائل التواصل الاجتماعي',
            'Privacy Policy': 'سياسة الخصوصية',
            'Terms of Use': 'شروط الاستخدام',
            'Technical Support': 'الدعم الفني',
            'All rights reserved - Wareeth': 'جميع الحقوق محفوظة - وريث'
        }
    };

    const currentTranslations = translations[language] || {};

    // ترجمة عناصر التنقل
    document.querySelectorAll('.dropdown-item').forEach(item => {
        const text = item.textContent.trim();
        const iconElement = item.querySelector('i');
        const iconClass = iconElement ? iconElement.className : '';
        
        if (currentTranslations[text]) {
            item.innerHTML = iconElement ? `<i class="${iconClass}"></i> ${currentTranslations[text]}` : currentTranslations[text];
        }
    });

    // ترجمة الأزرار
    document.querySelectorAll('.join-header-btn, .user-menu-toggle').forEach(btn => {
        const text = btn.textContent.trim();
        const iconElement = btn.querySelector('i');
        const iconClass = iconElement ? iconElement.className : '';
        
        if (currentTranslations[text]) {
            btn.innerHTML = iconElement ? `<i class="${iconClass}"></i> ${currentTranslations[text]}` : currentTranslations[text];
        }
    });

    // ترجمة العناوين والنصوص
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a').forEach(element => {
        // تجنب العناصر التي تحتوي على عناصر فرعية أو أيقونات
        if (element.children.length === 0 || (element.children.length === 1 && element.children[0].tagName === 'I')) {
            const text = element.textContent.trim();
            const iconElement = element.querySelector('i');
            
            if (currentTranslations[text]) {
                if (iconElement) {
                    const iconClass = iconElement.className;
                    element.innerHTML = `<i class="${iconClass}"></i> ${currentTranslations[text]}`;
                } else {
                    element.textContent = currentTranslations[text];
                }
            }
        }
    });

    // ترجمة النماذج
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (currentTranslations[placeholder]) {
            input.setAttribute('placeholder', currentTranslations[placeholder]);
        }
    });

    // ترجمة خيارات القوائم المنسدلة
    document.querySelectorAll('option').forEach(option => {
        const text = option.textContent.trim();
        if (currentTranslations[text]) {
            option.textContent = currentTranslations[text];
        }
    });
}

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

