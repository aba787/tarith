document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage system with fallback
    let db = null;
    let useLocalStorage = false;

    // Try to initialize IndexedDB
    if (typeof indexedDB !== 'undefined') {
        const dbRequest = indexedDB.open('WarithMembersDB', 1);

        dbRequest.onerror = function(event) {
            console.warn('IndexedDB not available, falling back to localStorage');
            useLocalStorage = true;
            initializeWithLocalStorage();
        };

        dbRequest.onsuccess = function(event) {
            db = event.target.result;
            console.log('IndexedDB initialized successfully');
            loadMembersFromDB();
            loadStatisticsFromDB();
        };

        dbRequest.onupgradeneeded = function(event) {
            db = event.target.result;

            // Create object stores
            if (!db.objectStoreNames.contains('members')) {
                const membersStore = db.createObjectStore('members', { keyPath: 'id', autoIncrement: true });
                membersStore.createIndex('email', 'email', { unique: true });
                membersStore.createIndex('role', 'role', { unique: false });
            }

            if (!db.objectStoreNames.contains('articles')) {
                const articlesStore = db.createObjectStore('articles', { keyPath: 'id', autoIncrement: true });
                articlesStore.createIndex('status', 'status', { unique: false });
            }

            if (!db.objectStoreNames.contains('activities')) {
                db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
            }
            // Add a store for news articles
            if (!db.objectStoreNames.contains('news')) {
                db.createObjectStore('news', { keyPath: 'id', autoIncrement: true });
            }
        };
    } else {
        console.warn('IndexedDB not supported, using localStorage');
        useLocalStorage = true;
        initializeWithLocalStorage();
    }

    function initializeWithLocalStorage() {
        // Initialize with localStorage only
        loadMembersFromDB();
        loadStatisticsFromDB();
    }

    // Enhanced login functionality
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminDashboard = document.getElementById('adminDashboard');
    const logoutBtn = document.getElementById('logoutBtn');

    // Enhanced credentials with encryption simulation
    const credentials = {
        'admin': 'password123',
        'warith_admin': 'warith2023',
        'manager': 'manager123',
        'Wareeth_Team@gmail.com': 'W4r3th#private',
        'supervisor': 'super123',
        'coordinator': 'coord456'
    };

    // Session management
    let currentSession = null;

    // Check for existing session
    const savedSession = localStorage.getItem('warithSession');
    if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.expires > Date.now()) {
            currentSession = session;
            autoLogin(session);
        } else {
            localStorage.removeItem('warithSession');
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fullName = document.getElementById('fullName').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Enhanced validation
            if (!fullName.trim()) {
                showNotification('يرجى إدخال الاسم الكامل', 'error');
                return;
            }

            if (!username.trim() || !password.trim()) {
                showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
                return;
            }

            if (credentials[username] && credentials[username] === password) {
                // Create session
                const sessionData = {
                    fullName: fullName,
                    username: username,
                    loginTime: new Date().toISOString(),
                    expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                    sessionId: generateSessionId()
                };

                currentSession = sessionData;
                localStorage.setItem('warithSession', JSON.stringify(sessionData));

                // Log activity
                logActivity('login', `تسجيل دخول المستخدم: ${fullName}`);

                // Successful login
                performLogin(sessionData);

                // Show enhanced welcome message
                showNotification(`مرحباً ${fullName}! تم تسجيل الدخول بنجاح`, 'success');

                // Update last login
                updateLastLogin(username);

            } else {
                // Failed login
                logActivity('failed_login', `محاولة دخول فاشلة: ${username}`);
                showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');

                // Add security delay
                setTimeout(() => {
                    loginForm.querySelector('[type="submit"]').disabled = false;
                }, 2000);
                loginForm.querySelector('[type="submit"]').disabled = true;
            }
        });
    }

    // Auto-login function
    function autoLogin(sessionData) {
        currentSession = sessionData;
        performLogin(sessionData);

        // Show appropriate buttons for auto-login
        const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
        const joinHeaderBtn = document.getElementById('joinHeaderBtn');

        if (logoutHeaderBtn) {
            logoutHeaderBtn.style.display = 'flex';
        }
        if (joinHeaderBtn) {
            joinHeaderBtn.style.display = 'none';
        }
    }

    // Perform login actions
    function performLogin(sessionData) {
        loginSection.style.display = 'none';
        adminDashboard.style.display = 'block';
        document.getElementById('adminName').textContent = sessionData.fullName;

        // Show logout button and hide join button after login
        const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
        const joinHeaderBtn = document.getElementById('joinHeaderBtn');

        if (logoutHeaderBtn) {
            logoutHeaderBtn.style.display = 'flex';
        }
        if (joinHeaderBtn) {
            joinHeaderBtn.style.display = 'none';
        }

        // Start session timer
        startSessionTimer();

        // Load dashboard data
        loadDashboardData();
    }

    // Generate session ID
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Session timer
    function startSessionTimer() {
        setInterval(() => {
            if (currentSession && currentSession.expires < Date.now()) {
                showNotification('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى', 'warning');
                performLogout();
            }
        }, 60000); // Check every minute
    }

    // Enhanced logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogoutConfirmation();
        });
    }

    // Header logout button functionality
    const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
    if (logoutHeaderBtn) {
        logoutHeaderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogoutConfirmation();
        });
    }

    // Show logout confirmation modal
    function showLogoutConfirmation() {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal logout-confirm-modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تأكيد تسجيل الخروج</h3>
                </div>
                <div class="modal-body">
                    <p>هل أنت متأكد من تسجيل الخروج؟</p>
                    <p class="logout-warning">سيتم إنهاء الجلسة الحالية وإعادتك إلى صفحة تسجيل الدخول.</p>
                    <div class="confirm-actions">
                        <button class="btn danger logout-confirm" onclick="confirmLogout()">
                            <i class="fas fa-sign-out-alt"></i>
                            نعم، سجل الخروج
                        </button>
                        <button class="btn secondary logout-cancel" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);
        confirmModal.style.display = 'block';

        // Add event listener for confirm button
        window.confirmLogout = function() {
            performLogout();
            confirmModal.remove();
        };
    }

    function performLogout() {
        // Show loading state
        const loadingNotification = showNotification('جاري تسجيل الخروج...', 'info');

        setTimeout(() => {
            if (currentSession) {
                // Log activity only if db is available
                if (db) {
                    logActivity('logout', `تسجيل خروج المستخدم: ${currentSession.fullName}`);
                }
            }

            // Clear session data
            const userName = currentSession ? currentSession.fullName : 'المستخدم';
            currentSession = null;
            localStorage.removeItem('warithSession');

            // Reset UI
            if (loginSection && adminDashboard && loginForm) {
                loginSection.style.display = 'block';
                adminDashboard.style.display = 'none';
                loginForm.reset();
            }

            // Show join button and hide logout button after logout
            const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
            const joinHeaderBtn = document.getElementById('joinHeaderBtn');

            if (logoutHeaderBtn) {
                logoutHeaderBtn.style.display = 'none';
            }
            if (joinHeaderBtn) {
                joinHeaderBtn.style.display = 'flex';
            }

            // Clear sensitive data
            clearDashboardData();

            // Remove loading notification
            if (loadingNotification && loadingNotification.parentNode) {
                loadingNotification.remove();
            }

            // Show success message
            showNotification(`وداعاً ${userName}! تم تسجيل الخروج بنجاح`, 'success');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        }, 1000); // Small delay for better UX
    }

    // Activity logging function
    function logActivity(type, description) {
        if (!db && !useLocalStorage) {
            console.log('Database not available, activity not logged:', type, description);
            return;
        }

        if (useLocalStorage || !db) {
            const activities = JSON.parse(localStorage.getItem('warithActivities') || '[]');
            const activity = {
                type: type,
                description: description,
                timestamp: new Date().toISOString(),
                user: currentSession ? currentSession.fullName : 'غير معروف',
                sessionId: currentSession ? currentSession.sessionId : null
            };
            activities.push(activity);
            localStorage.setItem('warithActivities', JSON.stringify(activities));
            return;
        }

        try {
            const transaction = db.transaction(['activities'], 'readwrite');
            const store = transaction.objectStore('activities');

            const activity = {
                type: type,
                description: description,
                timestamp: new Date().toISOString(),
                user: currentSession ? currentSession.fullName : 'غير معروف',
                sessionId: currentSession ? currentSession.sessionId : null
            };

            store.add(activity);
        } catch (error) {
            console.log('Activity logging failed:', error);
        }
    }

    // Update last login
    function updateLastLogin(username) {
        const lastLogins = JSON.parse(localStorage.getItem('warithLastLogins') || '{}');
        lastLogins[username] = new Date().toISOString();
        localStorage.setItem('warithLastLogins', JSON.stringify(lastLogins));
    }

    // Load dashboard data
    function loadDashboardData() {
        loadMembersFromDB();
        loadStatisticsFromDB();
        loadRecentActivities();
    }

    // Clear dashboard data
    function clearDashboardData() {
        // Clear sensitive information from DOM
        const tableBody = document.getElementById('membersTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6">يرجى تسجيل الدخول لعرض البيانات</td></tr>';
        }
    }

    // Modal functionality
    const addMemberBtn = document.getElementById('addMemberBtn');
    const addMemberModal = document.getElementById('addMemberModal');
    const closeModal = document.getElementById('closeModal');
    const cancelAdd = document.getElementById('cancelAdd');
    const addMemberForm = document.getElementById('addMemberForm');

    if (addMemberBtn && addMemberModal) {
        addMemberBtn.addEventListener('click', function() {
            addMemberModal.style.display = 'block';
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                addMemberModal.style.display = 'none';
            });
        }

        if (cancelAdd) {
            cancelAdd.addEventListener('click', function() {
                addMemberModal.style.display = 'none';
            });
        }

        // Close modal on outside click
        window.addEventListener('click', function(event) {
            if (event.target === addMemberModal) {
                addMemberModal.style.display = 'none';
            }
        });
    }

    // Enhanced add member form submission
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(addMemberForm);
            const memberData = {
                name: formData.get('memberName'),
                email: formData.get('memberEmail'),
                role: formData.get('memberRole'),
                phone: formData.get('memberPhone')
            };

            // Enhanced validation
            if (!validateMemberData(memberData)) {
                return;
            }

            // Show loading state
            const submitBtn = addMemberForm.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="loading"></i> جاري الإضافة...';
            submitBtn.disabled = true;

            // Save to database
            saveMemberToDB(memberData)
                .then((savedMember) => {
                    // Close modal and reset form
                    addMemberModal.style.display = 'none';
                    addMemberForm.reset();

                    // Reload members list
                    loadMembersFromDB();

                    showNotification('تم إضافة العضو بنجاح!', 'success');
                })
                .catch((error) => {
                    console.error('Error adding member:', error);
                    if (error.includes('email')) {
                        showNotification('البريد الإلكتروني مستخدم بالفعل', 'error');
                    } else {
                        showNotification('حدث خطأ أثناء إضافة العضو', 'error');
                    }
                })
                .finally(() => {
                    // Reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Member data validation
    function validateMemberData(data) {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        document.querySelectorAll('input').forEach(input => {
            input.style.borderColor = '';
        });

        let isValid = true;

        if (!data.name || data.name.trim().length < 2) {
            showFieldError('memberName', 'يجب أن يكون الاسم أكثر من حرفين');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            showFieldError('memberEmail', 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
        }

        if (!data.role) {
            showFieldError('memberRole', 'يجب اختيار دور للعضو');
            isValid = false;
        }

        if (data.phone && data.phone.trim() && !data.phone.match(/^[\d+\-\s()]+$/)) {
            showFieldError('memberPhone', 'يرجى إدخال رقم هاتف صحيح');
            isValid = false;
        }

        return isValid;
    }

    // Show field-specific error
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const formGroup = field.parentNode;

        // Remove existing error
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.9rem; margin-top: 0.5rem; font-weight: 600;';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);

        // Style field
        field.style.borderColor = '#dc3545';
        field.focus();
    }

    // Articles management
    const manageArticlesBtn = document.getElementById('manageArticlesBtn');
    const articlesManagement = document.getElementById('articlesManagement');
    const backToMembers = document.getElementById('backToMembers');
    const membersSection = document.querySelector('.members-section');

    if (manageArticlesBtn) {
        manageArticlesBtn.addEventListener('click', function() {
            if (membersSection) membersSection.style.display = 'none';
            if (articlesManagement) articlesManagement.style.display = 'block';
            loadArticles('published');
        });
    }

    if (backToMembers) {
        backToMembers.addEventListener('click', function() {
            if (articlesManagement) articlesManagement.style.display = 'none';
            if (membersSection) membersSection.style.display = 'block';
        });
    }

    // Article tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(tab => tab.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');

            const tabType = this.getAttribute('data-tab');
            loadArticles(tabType);
        });
    });

    // Enhanced export data functionality
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            showExportOptions();
        });
    }

    // Management sections functionality
    const manageNewsBtn = document.getElementById('manageNewsBtn');
    const manageStatsBtn = document.getElementById('manageStatsBtn');
    const managePartnersBtn = document.getElementById('managePartnersBtn');
    const manageContentBtn = document.getElementById('manageContentBtn');
    const siteSettingsBtn = document.getElementById('siteSettingsBtn');

    const newsModal = document.getElementById('newsModal');
    const statsManagement = document.getElementById('statsManagement');
    const partnersManagement = document.getElementById('partnersManagement');
    const contentManagement = document.getElementById('contentManagement');
    const siteSettings = document.getElementById('siteSettings');

    const closeNewsModal = document.getElementById('closeNewsModal');

    if (manageNewsBtn && newsModal) {
        manageNewsBtn.addEventListener('click', function() {
            newsModal.style.display = 'block';
            loadPublishedNews();
        });

        if (closeNewsModal) {
            closeNewsModal.addEventListener('click', function() {
                newsModal.style.display = 'none';
            });
        }

        // Close modal on outside click
        window.addEventListener('click', function(event) {
            if (event.target === newsModal) {
                newsModal.style.display = 'none';
            }
        });
    }

    // Statistics management
    if (manageStatsBtn && statsManagement) {
        manageStatsBtn.addEventListener('click', function() {
            hideAllSections();
            statsManagement.style.display = 'block';
            loadCurrentStats();
        });
    }

    // Partners management
    if (managePartnersBtn && partnersManagement) {
        managePartnersBtn.addEventListener('click', function() {
            hideAllSections();
            partnersManagement.style.display = 'block';
            loadCurrentPartners();
        });
    }

    // Content management
    if (manageContentBtn && contentManagement) {
        manageContentBtn.addEventListener('click', function() {
            hideAllSections();
            contentManagement.style.display = 'block';
            loadCurrentContent();
        });
    }

    // Site settings
    if (siteSettingsBtn && siteSettings) {
        siteSettingsBtn.addEventListener('click', function() {
            hideAllSections();
            siteSettings.style.display = 'block';
            loadSiteSettings();
        });
    }

    // Articles publishing
    const publishArticlesBtn = document.getElementById('publishArticlesBtn');
    const articlesPublishing = document.getElementById('articlesPublishing');

    if (publishArticlesBtn && articlesPublishing) {
        publishArticlesBtn.addEventListener('click', function() {
            hideAllSections();
            articlesPublishing.style.display = 'block';
            loadPublishedArticles();
        });
    }

    // Back buttons
    document.getElementById('backFromStats')?.addEventListener('click', () => showMainDashboard());
    document.getElementById('backFromPartners')?.addEventListener('click', () => showMainDashboard());
    document.getElementById('backFromContent')?.addEventListener('click', () => showMainDashboard());
    document.getElementById('backFromSettings')?.addEventListener('click', () => showMainDashboard());
    document.getElementById('backFromArticles')?.addEventListener('click', () => showMainDashboard());

    function showExportOptions() {
        const exportModal = document.createElement('div');
        exportModal.className = 'modal export-modal';
        exportModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تصدير البيانات</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="export-options">
                        <button class="export-btn" onclick="exportMembersData('csv')">
                            <i class="fas fa-file-csv"></i>
                            تصدير الأعضاء (CSV)
                        </button>
                        <button class="export-btn" onclick="exportMembersData('json')">
                            <i class="fas fa-file-code"></i>
                            تصدير الأعضاء (JSON)
                        </button>
                        <button class="export-btn" onclick="exportActivitiesData()">
                            <i class="fas fa-history"></i>
                            تصدير سجل الأنشطة
                        </button>
                        <button class="export-btn" onclick="exportStatisticsReport()">
                            <i class="fas fa-chart-bar"></i>
                            تقرير إحصائي شامل
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(exportModal);
        exportModal.style.display = 'block';
    }

    // Enhanced search functionality
    let searchTimeout;

    function initializeSearchAndFilter() {
        // Wait for DOM to be fully loaded
        setTimeout(() => {
            const memberSearch = document.getElementById('memberSearch');
            const roleFilter = document.getElementById('roleFilter');

            if (memberSearch) {
                memberSearch.addEventListener('input', function() {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        performAdvancedSearch();
                    }, 300);
                    filterMembers();
                });
            }

            if (roleFilter) {
                roleFilter.addEventListener('change', function() {
                    filterMembers();
                });
            }
        }, 1000);
    }

    function performAdvancedSearch() {
        const memberSearch = document.getElementById('memberSearch');
        const roleFilter = document.getElementById('roleFilter');

        if (!memberSearch || !roleFilter) return;

        const searchTerm = memberSearch.value.toLowerCase();
        const roleFilterValue = roleFilter.value;
        const rows = document.querySelectorAll('#membersTableBody tr');

        let visibleCount = 0;

        rows.forEach(row => {
            const name = row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
            const email = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
            const roleCell = row.querySelector('.role');
            const role = roleCell ? roleCell.textContent.toLowerCase() : '';

            const matchesSearch = !searchTerm || 
                name.includes(searchTerm) || 
                email.includes(searchTerm);
            const matchesRole = roleFilterValue === 'all' || role.includes(roleFilterValue);

            if (matchesSearch && matchesRole) {
                row.style.display = '';
                visibleCount++;
                // Highlight search terms
                highlightSearchTerms(row, searchTerm);
            } else {
                row.style.display = 'none';
            }
        });

        // Update search results count
        updateSearchResultsCount(visibleCount);
    }

    function highlightSearchTerms(row, searchTerm) {
        if (!searchTerm || !row.cells[0] || !row.cells[1]) return;

        const nameCell = row.cells[0];
        const emailCell = row.cells[1];

        [nameCell, emailCell].forEach(cell => {
            const originalText = cell.textContent;
            const highlightedText = originalText.replace(
                new RegExp(searchTerm, 'gi'),
                `<mark>$&</mark>`
            );
            if (highlightedText !== originalText) {
                cell.innerHTML = highlightedText;
            }
        });
    }

    function updateSearchResultsCount(count) {
        let counter = document.querySelector('.search-results-count');
        const searchFilter = document.querySelector('.search-filter');

        if (!counter && searchFilter) {
            counter = document.createElement('div');
            counter.className = 'search-results-count';
            searchFilter.appendChild(counter);
        }

        if (counter) {
            counter.textContent = `عُثر على ${count} نتيجة`;
        }
    }

    function loadPublishedNews() {
        const publishedNewsList = document.getElementById('publishedNewsList');
        if (!publishedNewsList) return;

        const savedNews = JSON.parse(localStorage.getItem('warithNews') || '[]');

        publishedNewsList.innerHTML = savedNews.map(news => `
            <div class="news-admin-item" data-news-id="${news.id}">
                <div class="news-admin-header">
                    <h4>${news.title}</h4>
                    <div class="news-admin-actions">
                        <button class="btn-icon edit" onclick="editNews(${news.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteNews(${news.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="news-admin-meta">
                    <span class="news-admin-date">${news.date}</span>
                    <span class="news-admin-category">${news.category}</span>
                </div>
                <p class="news-admin-summary">${news.summary}</p>
            </div>
        `).join('');
    }

    // Initialize search and filter after DOM is ready
    initializeSearchAndFilter();

    // Member action buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-icon.edit')) {
            const row = e.target.closest('tr');
            if (row) {
                const memberId = row.getAttribute('data-member-id');
                if (memberId) {
                    editMember(parseInt(memberId));
                }
            }
        }

        if (e.target.closest('.btn-icon.delete')) {
            const row = e.target.closest('tr');
            if (row) {
                const memberId = row.getAttribute('data-member-id');
                if (memberId) {
                    deleteMember(parseInt(memberId));
                }
            }
        }
    });

    // Image preview handling
    const imageInput = document.getElementById('newsImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (imageInput && imagePreview && previewImg) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
            }
        });
    }

    // News form handling
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(e.target);

            // Validate form data
            if (!validateNewsForm(formData)) {
                return;
            }

            const submitBtn = newsForm.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري النشر...';
            submitBtn.disabled = true;

            const imageFile = formData.get('newsImage');

            const processNewsData = (imageDataUrl = null) => {
                const newsData = {
                    id: Date.now(),
                    title: formData.get('newsTitle'),
                    summary: formData.get('newsSummary'),
                    content: formData.get('newsContent'),
                    category: formData.get('newsCategory'),
                    date: formData.get('newsDate') || new Date().toISOString().split('T')[0],
                    author: currentSession ? currentSession.fullName : 'إدارة الموقع',
                    status: 'published',
                    image: imageDataUrl,
                    createdAt: new Date().toISOString()
                };

                // Save to localStorage
                const existingNews = JSON.parse(localStorage.getItem('warithNews') || '[]');

                // Check if we are editing an existing news item
                const editId = submitBtn.getAttribute('data-edit-id');
                if (editId) {
                    const newsIndex = existingNews.findIndex(news => news.id == editId);
                    if (newsIndex !== -1) {
                        // Update existing news
                        newsData.id = parseInt(editId); // Keep original ID
                        newsData.createdAt = existingNews[newsIndex].createdAt; // Preserve creation date
                        existingNews[newsIndex] = newsData;
                        logActivity('news_updated', `تم تحديث الخبر: ${newsData.title}`);
                    } else {
                        // Should not happen if editId is set correctly, but as fallback add as new
                        existingNews.unshift(newsData);
                        logActivity('news_published', `تم نشر خبر جديد: ${newsData.title}`);
                    }
                    submitBtn.removeAttribute('data-edit-id'); // Remove edit ID
                } else {
                    // Add as new news item
                    existingNews.unshift(newsData);
                    logActivity('news_published', `تم نشر خبر جديد: ${newsData.title}`);
                }

                localStorage.setItem('warithNews', JSON.stringify(existingNews));

                // Save to IndexedDB
                if (db) {
                    try {
                        const transaction = db.transaction(['news'], 'readwrite');
                        const store = transaction.objectStore('news');
                        if (editId) {
                            store.put(newsData); // Update existing
                        } else {
                            store.add(newsData); // Add new
                        }
                    } catch (error) {
                        console.log('News save to IndexedDB failed:', error);
                    }
                }

                // Reset form
                e.target.reset();
                if (imagePreview) imagePreview.style.display = 'none';

                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Show success message
                showNotification(`تم ${editId ? 'تحديث' : 'نشر'} الخبر بنجاح!`, 'success');

                // Refresh published news display
                loadPublishedNews();

                // Sync with main page
                syncWithMainPage();
                
                // Sync with other tabs (if implemented)
                syncWithServer();
            };

            // Handle image upload with validation
            if (imageFile && imageFile.size > 0) {
                // Check file size (max 5MB)
                if (imageFile.size > 5 * 1024 * 1024) {
                    showNotification('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                // Check file type
                if (!imageFile.type.startsWith('image/')) {
                    showNotification('يرجى اختيار ملف صورة صحيح', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    processNewsData(e.target.result);
                };
                reader.onerror = function() {
                    showNotification('حدث خطأ في قراءة الصورة', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                };
                reader.readAsDataURL(imageFile);
            } else {
                // If no new image, process with existing image data if editing
                const editId = submitBtn.getAttribute('data-edit-id');
                if (editId) {
                    const existingNews = JSON.parse(localStorage.getItem('warithNews') || '[]');
                    const newsToEdit = existingNews.find(n => n.id == editId);
                    if (newsToEdit && newsToEdit.image) {
                        processNewsData(newsToEdit.image); // Keep existing image
                    } else {
                        processNewsData(); // No existing image
                    }
                } else {
                    processNewsData(); // New news without image
                }
            }
        });
    }

    // Validate news form
    function validateNewsForm(formData) {
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());

        if (!formData.get('newsTitle') || formData.get('newsTitle').trim() === '') {
            showFieldError('newsTitle', 'عنوان الخبر مطلوب');
            isValid = false;
        }

        if (!formData.get('newsSummary') || formData.get('newsSummary').trim() === '') {
            showFieldError('newsSummary', 'ملخص الخبر مطلوب');
            isValid = false;
        }

        if (!formData.get('newsContent') || formData.get('newsContent').trim() === '') {
            showFieldError('newsContent', 'محتوى الخبر مطلوب');
            isValid = false;
        }

        if (!formData.get('newsCategory') || formData.get('newsCategory').trim() === '') {
            showFieldError('newsCategory', 'التصنيف مطلوب');
            isValid = false;
        }

        return isValid;
    }

    // Enhanced database functions
    function saveMemberToDB(memberData) {
        return new Promise((resolve, reject) => {
            if (!db && !useLocalStorage) {
                reject('Database not available');
                return;
            }

            if (useLocalStorage || !db) {
                // Use localStorage
                const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');

                // Check for duplicate email
                if (members.find(m => m.email === memberData.email)) {
                    reject('email already exists');
                    return;
                }

                const member = {
                    ...memberData,
                    id: Date.now(),
                    joinDate: new Date().toLocaleDateString('ar-SA'),
                    status: 'active'
                };

                members.push(member);
                localStorage.setItem('warithMembers', JSON.stringify(members));
                resolve(member);
                return;
            }

            const transaction = db.transaction(['members'], 'readwrite');
            const store = transaction.objectStore('members');

            // Add timestamp and status
            const member = {
                ...memberData,
                joinDate: new Date().toLocaleDateString('ar-SA'),
                status: 'active',
                id: Date.now() // Fallback ID
            };

            const request = store.add(member);

            request.onsuccess = function(event) {
                resolve({
                    ...member,
                    id: event.target.result
                });
            };

            request.onerror = function(event) {
                const error = event.target.error;
                if (error.name === 'ConstraintError') {
                    reject('email already exists');
                } else {
                    reject(error.message || 'Unknown error occurred');
                }
            };
        });
    }

    function loadMembersFromDB() {
        if (!db && !useLocalStorage) {
            console.log('Database not available, loading sample data');
            loadSampleMembers();
            return;
        }

        if (useLocalStorage || !db) {
            // Use localStorage
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            if (members.length === 0) {
                loadSampleMembers();
            } else {
                displayMembers(members);
                updateMemberStats(members);
            }
            return;
        }

        const transaction = db.transaction(['members'], 'readonly');
        const store = transaction.objectStore('members');
        const request = store.getAll();

        request.onsuccess = function() {
            const members = request.result || [];
            if (members.length === 0) {
                loadMembersFromLocalStorage();
            } else {
                displayMembersInTable(members);
                updateMemberStats(members);
            }
        };

        request.onerror = function() {
            console.warn('Error loading members from IndexedDB, using localStorage');
            loadMembersFromLocalStorage();
        };
    }

    function loadMembersFromLocalStorage() {
        const savedMembers = JSON.parse(localStorage.getItem('warithMembers') || '[]');
        if (savedMembers.length > 0) {
            displayMembersInTable(savedMembers);
            updateMemberStats(savedMembers);
        } else {
            console.log('Database not available, loading sample data');
            loadSampleMembers();
        }
    }

    function loadSampleMembers() {
        // Load sample data when database is not available
        const sampleMembers = [
            {
                id: 1,
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                role: 'admin',
                phone: '+966 50 123 4567',
                createdAt: '2023-01-15T00:00:00.000Z',
                status: 'active',
                loginCount: 15,
                lastLogin: '2023-12-01T00:00:00.000Z',
                createdBy: 'النظام'
            },
            {
                id: 2,
                name: 'فاطمة علي',
                email: 'fatima@example.com',
                role: 'writer',
                phone: '+966 50 234 5678',
                createdAt: '2023-03-20T00:00:00.000Z',
                status: 'active',
                loginCount: 8,
                lastLogin: '2023-11-28T00:00:00.000Z',
                createdBy: 'النظام'
            },
            {
                id: 3,
                name: 'خالد الأحمد',
                email: 'khalid@example.com',
                role: 'member',
                phone: '+966 50 345 6789',
                createdAt: '2023-06-10T00:00:00.000Z',
                status: 'inactive',
                loginCount: 3,
                lastLogin: '2023-10-15T00:00:00.000Z',
                createdBy: 'النظام'
            }
        ];

        displayMembersInTable(sampleMembers);
        updateMemberStats(sampleMembers);
    }

    function displayMembersInTable(members) {
        const tableBody = document.getElementById('membersTableBody');
        if (!tableBody) return;

        const roleNames = {
            'admin': 'مدير',
            'member': 'عضو',
            'writer': 'كاتب',
            'supervisor': 'مشرف',
            'coordinator': 'منسق'
        };

        tableBody.innerHTML = members.map(member => `
            <tr data-member-id="${member.id}" class="member-row">
                <td class="member-name">
                    <div class="member-info">
                        <strong>${member.name}</strong>
                        <small>انضم في: ${new Date(member.createdAt).toLocaleDateString('ar-SA')}</small>
                    </div>
                </td>
                <td class="member-email">
                    <a href="mailto:${member.email}" class="email-link">${member.email}</a>
                </td>
                <td><span class="role ${member.role}">${roleNames[member.role] || member.role}</span></td>
                <td class="member-stats">
                    <div class="stat-item">
                        <span class="stat-value">${member.loginCount || 0}</span>
                        <span class="stat-label">دخول</span>
                    </div>
                </td>
                <td>
                    <span class="status ${member.status}">${member.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    ${member.lastLogin ? `<small>آخر دخول: ${new Date(member.lastLogin).toLocaleDateString('ar-SA')}</small>` : ''}
                </td>
                <td class="actions">
                    <button class="btn-icon view" title="عرض التفاصيل" onclick="viewMemberDetails(${member.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit" title="تعديل" onclick="editMember(${member.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon ${member.status === 'active' ? 'toggle-inactive' : 'toggle-active'}" 
                            title="${member.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}"
                            onclick="toggleMemberStatus(${member.id})">
                        <i class="fas fa-${member.status === 'active' ? 'user-slash' : 'user-check'}"></i>
                    </button>
                    <button class="btn-icon delete" title="حذف" onclick="deleteMember(${member.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Enhanced member management functions
    window.viewMemberDetails = function(memberId) {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }
        if (useLocalStorage || !db) {
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            const member = members.find(m => m.id === memberId);
            if (member) {
                showMemberDetailsModal(member);
            }
            return;
        }

        const transaction = db.transaction(['members'], 'readonly');
        const store = transaction.objectStore('members');
        const request = store.get(memberId);

        request.onsuccess = function() {
            const member = request.result;
            if (member) {
                showMemberDetailsModal(member);
            }
        };
    };

    function showMemberDetailsModal(member) {
        const modal = document.createElement('div');
        modal.className = 'modal member-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تفاصيل العضو: ${member.name}</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="member-details-grid">
                        <div class="detail-item">
                            <label>الاسم الكامل:</label>
                            <span>${member.name}</span>
                        </div>
                        <div class="detail-item">
                            <label>البريد الإلكتروني:</label>
                            <span>${member.email}</span>
                        </div>
                        <div class="detail-item">
                            <label>الدور:</label>
                            <span class="role ${member.role}">${member.role}</span>
                        </div>
                        <div class="detail-item">
                            <label>رقم الهاتف:</label>
                            <span>${member.phone || 'غير محدد'}</span>
                        </div>
                        <div class="detail-item">
                            <label>تاريخ الانضمام:</label>
                            <span>${member.createdAt ? new Date(member.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                        </div>
                        <div class="detail-item">
                            <label>عدد مرات الدخول:</label>
                            <span>${member.loginCount || 0}</span>
                        </div>
                        <div class="detail-item">
                            <label>آخر دخول:</label>
                            <span>${member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('ar-SA') : 'لم يسجل دخول بعد'}</span>
                        </div>
                        <div class="detail-item">
                            <label>أضيف بواسطة:</label>
                            <span>${member.createdBy || 'النظام'}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>الحالة:</label>
                            <span class="status ${member.status}">${member.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    window.toggleMemberStatus = function(memberId) {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        if (useLocalStorage || !db) {
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            const memberIndex = members.findIndex(m => m.id === memberId);
            if (memberIndex !== -1) {
                members[memberIndex].status = members[memberIndex].status === 'active' ? 'inactive' : 'active';
                members[memberIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('warithMembers', JSON.stringify(members));
                logActivity('member_status_changed', `تم ${members[memberIndex].status === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} العضو: ${members[memberIndex].name}`);
                loadMembersFromDB();
                showNotification(`تم ${members[memberIndex].status === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} العضو بنجاح`, 'success');
            }
            return;
        }

        const transaction = db.transaction(['members'], 'readwrite');
        const store = transaction.objectStore('members');
        const request = store.get(memberId);

        request.onsuccess = function() {
            const member = request.result;
            if (member) {
                member.status = member.status === 'active' ? 'inactive' : 'active';
                member.updatedAt = new Date().toISOString();

                const updateRequest = store.put(member);
                updateRequest.onsuccess = function() {
                    logActivity('member_status_changed', 
                        `تم ${member.status === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} العضو: ${member.name}`);
                    loadMembersFromDB();
                    showNotification(`تم ${member.status === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} العضو بنجاح`, 'success');
                };
            }
        };
    };

    // Enhanced statistics functions
    function updateMemberStats(members) {
        const totalMembers = document.getElementById('totalMembers');
        const activeMembers = document.getElementById('activeMembers');

        const totalCount = members.length;
        const activeCount = members.filter(m => m.status === 'active').length;

        if (totalMembers) totalMembers.textContent = totalCount;
        if (activeMembers) activeMembers.textContent = activeCount;

        // Update role distribution
        updateRoleDistribution(members);

        // Update activity chart
        updateActivityChart(members);
    }

    function loadStatisticsFromDB() {
        if (!db && !useLocalStorage) {
            console.log('Database not available for statistics');
            return;
        }

        if (useLocalStorage || !db) {
            // Use localStorage
            const articles = JSON.parse(localStorage.getItem('warithArticles') || '[]');
            updateArticleStats(articles);
            return;
        }

        try {
            // Load members statistics
            const membersTransaction = db.transaction(['members'], 'readonly');
            const membersStore = membersTransaction.objectStore('members');
            membersStore.getAll().onsuccess = function(event) {
                const members = event.target.result;
                updateMemberStats(members);
            };

            // Load articles statistics
            const articlesTransaction = db.transaction(['articles'], 'readonly');
            const articlesStore = articlesTransaction.objectStore('articles');
            articlesStore.getAll().onsuccess = function(event) {
                const articles = event.target.result;
                updateArticleStats(articles);
            };
        } catch (error) {
            console.log('Statistics loading failed:', error);
        }
    }

    function updateRoleDistribution(members) {
        const roleStats = {};
        members.forEach(member => {
            roleStats[member.role] = (roleStats[member.role] || 0) + 1;
        });

        // Create or update role distribution chart
        createRoleChart(roleStats);
    }

    function createRoleChart(roleStats) {
        const chartContainer = document.querySelector('.role-chart');
        if (!chartContainer) {
            // Create chart container if it doesn't exist
            const dashboardStats = document.querySelector('.dashboard-stats');
            if (dashboardStats) {
                const chartSection = document.createElement('div');
                chartSection.className = 'statistics-section';
                chartSection.innerHTML = `
                    <div class="chart-container">
                        <h3>توزيع الأدوار</h3>
                        <div class="role-chart"></div>
                    </div>
                `;
                dashboardStats.parentNode.insertBefore(chartSection, dashboardStats.nextSibling);
            }
        }

        const chart = document.querySelector('.role-chart');
        if (chart) {
            const roleNames = {
                'admin': 'مدير',
                'member': 'عضو', 
                'writer': 'كاتب',
                'supervisor': 'مشرف',
                'coordinator': 'منسق'
            };

            chart.innerHTML = Object.entries(roleStats).map(([role, count]) => `
                <div class="role-stat-item">
                    <div class="role-bar">
                        <div class="role-fill ${role}" style="width: ${(count/Object.values(roleStats).reduce((a,b) => a+b, 0)) * 100}%"></div>
                    </div>
                    <span class="role-label">${roleNames[role] || role}: ${count}</span>
                </div>
            `).join('');
        }
    }

    function updateActivityChart(members) {
        const now = new Date();
        const last30Days = new Array(30).fill(0).map((_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            return {
                date: date.toISOString().split('T')[0],
                count: 0
            };
        }).reverse();

        members.forEach(member => {
            if (member.createdAt) {
                const memberDate = new Date(member.createdAt).toISOString().split('T')[0];
                const dayIndex = last30Days.findIndex(day => day.date === memberDate);
                if (dayIndex !== -1) {
                    last30Days[dayIndex].count++;
                }
            }
        });

        createActivityChart(last30Days);
    }

    function createActivityChart(data) {
        const chartContainer = document.querySelector('.activity-chart');
        if (!chartContainer) {
            const dashboardStats = document.querySelector('.dashboard-stats');
            if (dashboardStats) {
                const activitySection = document.createElement('div');
                activitySection.className = 'activity-section';
                activitySection.innerHTML = `
                    <div class="chart-container">
                        <h3>نشاط انضمام الأعضاء (آخر 30 يوم)</h3>
                        <div class="activity-chart"></div>
                    </div>
                `;
                dashboardStats.parentNode.insertBefore(activitySection, dashboardStats.nextSibling);
            }
        }

        const chart = document.querySelector('.activity-chart');
        if (chart) {
            const maxCount = Math.max(...data.map(d => d.count));
            chart.innerHTML = data.map(day => `
                <div class="activity-bar" title="${day.date}: ${day.count} أعضاء">
                    <div class="bar-fill" style="height: ${maxCount > 0 ? (day.count/maxCount) * 100 : 0}%"></div>
                    <span class="bar-date">${new Date(day.date).getDate()}</span>
                </div>
            `).join('');
        }
    }

    function loadRecentActivities() {
        if (!db && !useLocalStorage) {
            console.log('Database not available for activities');
            return;
        }

        if (useLocalStorage || !db) {
            const activities = JSON.parse(localStorage.getItem('warithActivities') || '[]');
            displayRecentActivities(activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10));
            return;
        }

        try {
            const transaction = db.transaction(['activities'], 'readonly');
            const store = transaction.objectStore('activities');
            const request = store.getAll();

            request.onsuccess = function() {
                const activities = request.result
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 10); // Get last 10 activities

                displayRecentActivities(activities);
            };
        } catch (error) {
            console.log('Recent activities loading failed:', error);
        }
    }

    function displayRecentActivities(activities) {
        const container = document.querySelector('.recent-activities');
        if (!container) {
            // Create activities container
            const dashboard = document.querySelector('.admin-dashboard .container');
            if (dashboard) {
                const activitiesSection = document.createElement('div');
                activitiesSection.className = 'recent-activities-section';
                activitiesSection.innerHTML = `
                    <div class="section-header">
                        <h3>الأنشطة الأخيرة</h3>
                    </div>
                    <div class="recent-activities"></div>
                `;
                dashboard.appendChild(activitiesSection);
            }
        }

        const activitiesDiv = document.querySelector('.recent-activities');
        if (activitiesDiv) {
            activitiesDiv.innerHTML = activities.map(activity => `
                <div class="activity-item ${activity.type}">
                    <div class="activity-icon">
                        <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <p class="activity-description">${activity.description}</p>
                        <small class="activity-time">
                            ${formatRelativeTime(activity.timestamp)} - بواسطة ${activity.user}
                        </small>
                    </div>
                </div>
            `).join('');
        }
    }

    function getActivityIcon(type) {
        const icons = {
            'login': 'sign-in-alt',
            'logout': 'sign-out-alt',
            'member_added': 'user-plus',
            'member_deleted': 'user-minus',
            'member_status_changed': 'user-cog',
            'article_added': 'newspaper',
            'failed_login': 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    function formatRelativeTime(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diff = Math.floor((now - then) / 1000);

        if (diff < 60) return 'منذ لحظات';
        if (diff < 3600) return `منذ ${Math.floor(diff/60)} دقيقة`;
        if (diff < 86400) return `منذ ${Math.floor(diff/3600)} ساعة`;
        if (diff < 604800) return `منذ ${Math.floor(diff/86400)} يوم`;
        return then.toLocaleDateString('ar-SA');
    }

    // Function to load articles
    function loadArticles(type) {
        const articlesList = document.getElementById('articlesList');
        if (!articlesList) return;

        const sampleArticles = {
            published: [
                { title: 'التراث السعودي في العصر الحديث', author: 'أحمد محمد', date: '2023-12-15', status: 'منشور' },
                { title: 'دور التقنية في حفظ التراث', author: 'فاطمة علي', date: '2023-12-12', status: 'منشور' },
                { title: 'إحياء الحرف اليدوية التقليدية', author: 'خالد الأحمد', date: '2023-12-08', status: 'منشور' }
            ],
            pending: [
                { title: 'تطوير السياحة التراثية', author: 'سارة محمد', date: '2023-12-20', status: 'في الانتظار' },
                { title: 'الحفاظ على اللهجات المحلية', author: 'عبدالله علي', date: '2023-12-18', status: 'في الانتظار' }
            ],
            rejected: [
                { title: 'مقال غير مناسب', author: 'مجهول', date: '2023-12-10', status: 'مرفوض' }
            ]
        };

        const articles = sampleArticles[type] || [];

        articlesList.innerHTML = articles.map(article => `
            <div class="article-item">
                <div class="article-info">
                    <h4>${article.title}</h4>
                    <p>الكاتب: ${article.author} | التاريخ: ${article.date}</p>
                    <span class="article-status ${type}">${article.status}</span>
                </div>
                <div class="article-actions">
                    ${type === 'pending' ? `
                        <button class="btn-icon approve" title="موافقة">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon reject" title="رفض">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon view" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon delete" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Function to filter members
    function filterMembers() {
        const memberSearch = document.getElementById('memberSearch');
        const roleFilter = document.getElementById('roleFilter');

        if (!memberSearch || !roleFilter) return;

        const searchTerm = memberSearch.value.toLowerCase();
        const roleFilterValue = roleFilter.value;
        const rows = document.querySelectorAll('#membersTableBody tr');

        rows.forEach(row => {
            const name = row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
            const email = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
            const roleCell = row.cells[2] ? row.cells[2].textContent.toLowerCase() : '';

            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesRole = roleFilterValue === 'all' || roleCell.includes(roleFilterValue);

            if (matchesSearch && matchesRole) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Function to edit member
    window.editMember = function(memberId) {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        if (useLocalStorage || !db) {
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            const member = members.find(m => m.id === memberId);
            if (member) {
                fillMemberFormForEdit(member);
            }
            return;
        }

        const transaction = db.transaction(['members'], 'readonly');
        const store = transaction.objectStore('members');
        const request = store.get(memberId);

        request.onsuccess = function() {
            const member = request.result;
            if (member) {
                fillMemberFormForEdit(member);
            }
        };
        request.onerror = function(event) {
            console.error("Error fetching member for edit:", event);
            showNotification('حدث خطأ أثناء تحميل بيانات العضو', 'error');
        };
    };

    function fillMemberFormForEdit(member) {
        const memberNameField = document.getElementById('memberName');
        const memberEmailField = document.getElementById('memberEmail');
        const memberRoleField = document.getElementById('memberRole');
        const memberPhoneField = document.getElementById('memberPhone');

        if (memberNameField) memberNameField.value = member.name;
        if (memberEmailField) memberEmailField.value = member.email;
        if (memberRoleField) memberRoleField.value = member.role;
        if (memberPhoneField) memberPhoneField.value = member.phone || '';

        // Change form title and submit button text/action
        const modalTitle = document.querySelector('#addMemberModal .modal-header h3');
        if (modalTitle) modalTitle.textContent = 'تعديل بيانات العضو';
        const submitButton = document.querySelector('#addMemberForm [type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-save"></i> تحديث العضو';
            submitButton.setAttribute('data-member-id', member.id); // Store member ID for update
        }

        // Show the modal
        const addMemberModal = document.getElementById('addMemberModal');
        if (addMemberModal) addMemberModal.style.display = 'block';
        showNotification('تم تحميل بيانات العضو للتعديل', 'info');
    }

    // Enhanced member deletion with confirmation
    window.deleteMember = function(memberId) {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        let memberNameToConfirm = 'العضو';
        if (useLocalStorage || !db) {
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            const member = members.find(m => m.id === memberId);
            if (member) {
                memberNameToConfirm = member.name;
            }
        } else {
            const transaction = db.transaction(['members'], 'readonly');
            const store = transaction.objectStore('members');
            const request = store.get(memberId);

            request.onsuccess = function() {
                const member = request.result;
                if (member) {
                    memberNameToConfirm = member.name;
                }
            };
        }

        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal confirm-modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تأكيد الحذف</h3>
                </div>
                <div class="modal-body">
                    <p>هل أنت متأكد من حذف العضو <strong>${memberNameToConfirm}</strong>؟</p>
                    <p class="text-danger">هذا الإجراء لا يمكن التراجع عنه!</p>
                    <div class="confirm-actions">
                        <button class="btn danger" onclick="confirmDelete(${memberId})">نعم، احذف</button>
                        <button class="btn secondary" onclick="this.closest('.modal').remove()">إلغاء</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);
        confirmModal.style.display = 'block';
    };

    window.confirmDelete = function(memberId) {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        if (useLocalStorage || !db) {
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            const initialCount = members.length;
            const updatedMembers = members.filter(m => m.id !== memberId);
            localStorage.setItem('warithMembers', JSON.stringify(updatedMembers));

            if (updatedMembers.length < initialCount) {
                logActivity('member_deleted', `تم حذف العضو (ID: ${memberId})`);
                loadMembersFromDB();
                showNotification('تم حذف العضو بنجاح', 'success');
                const confirmModal = document.querySelector('.confirm-modal');
                if (confirmModal) confirmModal.remove();
            } else {
                showNotification('لم يتم العثور على العضو للحذف', 'error');
            }
            return;
        }

        const deleteTransaction = db.transaction(['members'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('members');

        // Get member name before deleting for logging
        deleteStore.get(memberId).onsuccess = function(event) {
            const member = event.target.result;
            const memberName = member ? member.name : 'عضو';

            deleteStore.delete(memberId).onsuccess = function() {
                logActivity('member_deleted', `تم حذف العضو: ${memberName}`);
                loadMembersFromDB();
                showNotification('تم حذف العضو بنجاح', 'success');
                const confirmModal = document.querySelector('.confirm-modal');
                if (confirmModal) confirmModal.remove();
            };
            deleteStore.delete(memberId).onerror = function(event) {
                console.error("Error deleting member:", event);
                showNotification('حدث خطأ أثناء حذف العضو', 'error');
            };
        };
        deleteStore.get(memberId).onerror = function(event) {
            console.error("Error fetching member before delete:", event);
            showNotification('حدث خطأ أثناء التحقق من بيانات العضو للحذف', 'error');
        };
    };

    // Enhanced export functions
    window.exportMembersData = function(format = 'csv') {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        // Show loading notification
        const loadingNotification = showNotification('جاري تصدير البيانات...', 'info');

        if (useLocalStorage || !db) {
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            if (members.length === 0) {
                loadingNotification.remove();
                showNotification('لا توجد بيانات أعضاء للتصدير', 'warning');
                return;
            }
            
            setTimeout(() => {
                if (format === 'csv') {
                    exportToCSV(members);
                } else if (format === 'json') {
                    exportToJSON(members);
                }
                logActivity('data_export', `تم تصدير بيانات الأعضاء بصيغة ${format.toUpperCase()}`);
                loadingNotification.remove();
            }, 1000);
            return;
        }

        const transaction = db.transaction(['members'], 'readonly');
        const store = transaction.objectStore('members');
        const request = store.getAll();

        request.onsuccess = function() {
            const members = request.result;

            if (format === 'csv') {
                exportToCSV(members);
            } else if (format === 'json') {
                exportToJSON(members);
            }

            logActivity('data_export', `تم تصدير بيانات الأعضاء بصيغة ${format.toUpperCase()}`);
        };
        request.onerror = function(event) {
            console.error("Error exporting members:", event);
            showNotification('حدث خطأ أثناء تصدير بيانات الأعضاء', 'error');
        };
    };

    function exportToCSV(members) {
        const csvContent = [
            'الرقم,الاسم,البريد الإلكتروني,الدور,رقم الهاتف,تاريخ الانضمام,الحالة,عدد تسجيلات الدخول,آخر دخول,أضيف بواسطة',
            ...members.map(member => [
                member.id,
                `"${member.name.replace(/"/g, '""')}"`, // Escape quotes in name
                member.email,
                member.role,
                member.phone || '',
                member.createdAt ? new Date(member.createdAt).toLocaleDateString('ar-SA') : '',
                member.status,
                member.loginCount || 0,
                member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('ar-SA') : 'لم يسجل دخول',
                member.createdBy || 'النظام'
            ].join(','))
        ].join('\n');

        downloadFile(csvContent, 'warith_members.csv', 'text/csv;charset=utf-8;');
        showNotification('تم تصدير البيانات كملف CSV', 'success');
    }

    function exportToJSON(members) {
        const jsonData = {
            exportDate: new Date().toISOString(),
            exportedBy: currentSession ? currentSession.fullName : 'غير معروف',
            totalMembers: members.length,
            members: members.map(member => ({
                ...member,
                exportNote: 'تم تصديره من نظام إدارة وريث'
            }))
        };

        const jsonContent = JSON.stringify(jsonData, null, 2);
        downloadFile(jsonContent, 'warith_members.json', 'application/json;charset=utf-8;');
        showNotification('تم تصدير البيانات كملف JSON', 'success');
    }

    window.exportActivitiesData = function() {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        if (useLocalStorage || !db) {
            const activities = JSON.parse(localStorage.getItem('warithActivities') || '[]');
            const csvContent = [
                'النوع,الوصف,التاريخ والوقت,المستخدم,معرف الجلسة',
                ...activities.map(activity => [
                    activity.type,
                    `"${activity.description.replace(/"/g, '""')}"`, // Escape quotes in description
                    new Date(activity.timestamp).toLocaleString('ar-SA'),
                    activity.user,
                    activity.sessionId || ''
                ].join(','))
            ].join('\n');

            downloadFile(csvContent, 'warith_activities.csv', 'text/csv;charset=utf-8;');
            showNotification('تم تصدير سجل الأنشطة (localStorage)', 'success');
            logActivity('data_export', 'تم تصدير سجل الأنشطة (localStorage)');
            return;
        }

        const transaction = db.transaction(['activities'], 'readonly');
        const store = transaction.objectStore('activities');
        const request = store.getAll();

        request.onsuccess = function() {
            const activities = request.result;

            const csvContent = [
                'النوع,الوصف,التاريخ والوقت,المستخدم,معرف الجلسة',
                ...activities.map(activity => [
                    activity.type,
                    `"${activity.description.replace(/"/g, '""')}"`, // Escape quotes in description
                    new Date(activity.timestamp).toLocaleString('ar-SA'),
                    activity.user,
                    activity.sessionId || ''
                ].join(','))
            ].join('\n');

            downloadFile(csvContent, 'warith_activities.csv', 'text/csv;charset=utf-8;');
            showNotification('تم تصدير سجل الأنشطة', 'success');
        };
        request.onerror = function(event) {
            console.error("Error exporting activities:", event);
            showNotification('حدث خطأ أثناء تصدير سجل الأنشطة', 'error');
        };
    };

    window.exportStatisticsReport = function() {
        if (!db && !useLocalStorage) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        if (useLocalStorage || !db) {
            const members = JSON.parse(localStorage.getItem('warithMembers') || '[]');
            const report = generateStatisticsReport(members);
            downloadFile(report, 'warith_statistics_report.html', 'text/html;charset=utf-8;');
            showNotification('تم إنشاء التقرير الإحصائي (localStorage)', 'success');
            logActivity('data_export', 'تم إنشاء التقرير الإحصائي (localStorage)');
            return;
        }

        // Collect all data for comprehensive report
        const membersTransaction = db.transaction(['members'], 'readonly');
        const membersStore = membersTransaction.objectStore('members');

        membersStore.getAll().onsuccess = function(event) {
            const members = event.target.result;

            const report = generateStatisticsReport(members);
            downloadFile(report, 'warith_statistics_report.html', 'text/html;charset=utf-8;');
            showNotification('تم إنشاء التقرير الإحصائي', 'success');
        };
        membersTransaction.onerror = function(event) {
            console.error("Error accessing members for statistics report:", event);
            showNotification('حدث خطأ أثناء تحميل بيانات الأعضاء للتقرير', 'error');
        };
    };

    function generateStatisticsReport(members) {
        const now = new Date();
        const roleStats = {};
        const statusStats = {};
        const monthlyJoins = {};

        members.forEach(member => {
            // Role distribution
            roleStats[member.role] = (roleStats[member.role] || 0) + 1;

            // Status distribution
            statusStats[member.status] = (statusStats[member.status] || 0) + 1;

            // Monthly joins
            const joinMonth = member.createdAt ? new Date(member.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }) : 'غير محدد';
            monthlyJoins[joinMonth] = (monthlyJoins[joinMonth] || 0) + 1;
        });

        return `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير إحصائي - فريق وريث</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                .header { background: linear-gradient(135deg, #DAA520 0%, #8B4513 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
                .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .stat-card h3 { color: #2F4F4F; margin-top: 0; }
                .stat-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .footer { text-align: center; color: #666; margin-top: 40px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>تقرير إحصائي شامل - فريق وريث</h1>
                <p>تاريخ إنشاء التقرير: ${now.toLocaleDateString('ar-SA')} ${now.toLocaleTimeString('ar-SA')}</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>إحصائيات عامة</h3>
                    <div class="stat-item"><span>إجمالي الأعضاء:</span><span>${members.length}</span></div>
                    <div class="stat-item"><span>الأعضاء النشطون:</span><span>${statusStats.active || 0}</span></div>
                    <div class="stat-item"><span>الأعضاء غير النشطين:</span><span>${statusStats.inactive || 0}</span></div>
                </div>

                <div class="stat-card">
                    <h3>توزيع الأدوار</h3>
                    ${Object.entries(roleStats).map(([role, count]) => 
                        `<div class="stat-item"><span>${role}:</span><span>${count}</span></div>`
                    ).join('')}
                </div>

                <div class="stat-card">
                    <h3>انضمامات شهرية</h3>
                    ${Object.entries(monthlyJoins).map(([month, count]) => 
                        `<div class="stat-item"><span>${month}:</span><span>${count}</span></div>`
                    ).join('')}
                </div>
            </div>

            <div class="footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام إدارة فريق وريث</p>
            </div>
        </body>
        </html>
        `;
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    // Enhanced news management functions
    window.deleteNews = function(newsId) {
        if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;

        const savedNews = JSON.parse(localStorage.getItem('warithNews') || '[]');
        const newsIndex = savedNews.findIndex(news => news.id == newsId);

        if (newsIndex !== -1) {
            const deletedNews = savedNews[newsIndex];
            savedNews.splice(newsIndex, 1);
            localStorage.setItem('warithNews', JSON.stringify(savedNews));

            // Remove from database if available
            if (db) {
                try {
                    const transaction = db.transaction(['news'], 'readwrite');
                    const store = transaction.objectStore('news');
                    store.delete(parseInt(newsId));
                } catch (error) {
                    console.log('News delete from IndexedDB failed', error);
                }
            }

            // Log activity
            logActivity('news_deleted', `تم حذف الخبر: ${deletedNews.title}`);

            // Refresh display
            loadPublishedNews();

            // Sync with other tabs (if implemented)
            syncWithServer(); 

            showNotification('تم حذف الخبر بنجاح', 'success');
        }
    };

    window.editNews = function(newsId) {
        const savedNews = JSON.parse(localStorage.getItem('warithNews') || '[]');
        const news = savedNews.find(n => n.id == newsId);

        if (news) {
            // Fill form with news data
            const newsTitleField = document.getElementById('newsTitle');
            const newsSummaryField = document.getElementById('newsSummary');
            const newsContentField = document.getElementById('newsContent');
            const newsCategoryField = document.getElementById('newsCategory');
            const newsDateField = document.getElementById('newsDate');

            if (newsTitleField) newsTitleField.value = news.title;
            if (newsSummaryField) newsSummaryField.value = news.summary;
            if (newsContentField) newsContentField.value = news.content;
            if (newsCategoryField) newsCategoryField.value = news.category;
            if (newsDateField) newsDateField.value = news.date;

            // Show image preview if exists
            if (news.image && imagePreview && previewImg) {
                previewImg.src = news.image;
                imagePreview.style.display = 'block';
            }

            // Change form to edit mode
            const submitBtn = newsForm.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> تحديث الخبر';
                submitBtn.setAttribute('data-edit-id', newsId);
            }

            showNotification('تم تحميل بيانات الخبر للتعديل', 'info');
        }
    };

    // Function to sync data with main page
    function syncWithMainPage() {
        // Trigger storage event to update other open tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'warithNews',
            newValue: localStorage.getItem('warithNews'),
            url: window.location.href
        }));
    }
    
    // Dummy function for syncWithServer (to be implemented if needed)
    function syncWithServer() {
        console.log("syncWithServer called - implementation needed.");
    }

    // Function to show notifications
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-triangle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add notification styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 10px;
                    color: white;
                    z-index: 10000;
                    animation: slideIn 0.3s ease forwards;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                    min-width: 300px;
                    opacity: 0;
                }

                .notification.success {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                }

                .notification.error {
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                }

                .notification.info {
                    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                }
                 .notification.warning {
                    background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
                }

                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .logout-warning {
                    color: #666;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                }

                .confirm-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 1.5rem;
                }

                .btn.danger {
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .btn.danger:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                }

                .btn.secondary {
                    background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .btn.secondary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Trigger the animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove after 3 seconds (except for loading notifications)
        if (type !== 'info' || !message.includes('جاري')) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }

        return notification; // Return notification element for manual removal
    }

    // Management functions
    function hideAllSections() {
        const membersSection = document.querySelector('.members-section');
        const articlesManagement = document.getElementById('articlesManagement');
        const statsManagement = document.getElementById('statsManagement');
        const partnersManagement = document.getElementById('partnersManagement');
        const contentManagement = document.getElementById('contentManagement');
        const siteSettings = document.getElementById('siteSettings');
        const articlesPublishing = document.getElementById('articlesPublishing');

        if (membersSection) membersSection.style.display = 'none';
        if (articlesManagement) articlesManagement.style.display = 'none';
        if (statsManagement) statsManagement.style.display = 'none';
        if (partnersManagement) partnersManagement.style.display = 'none';
        if (contentManagement) contentManagement.style.display = 'none';
        if (siteSettings) siteSettings.style.display = 'none';
        if (articlesPublishing) articlesPublishing.style.display = 'none';
    }

    function showMainDashboard() {
        hideAllSections();
        const membersSection = document.querySelector('.members-section');
        if (membersSection) membersSection.style.display = 'block';
    }

    // Statistics Management
    function loadCurrentStats() {
        const savedStats = JSON.parse(localStorage.getItem('warithStats') || '{}');

        const volunteersCountField = document.getElementById('volunteersCount');
        const volunteerHoursField = document.getElementById('volunteerHours');
        const placesCountField = document.getElementById('placesCount');
        const beneficiariesCountField = document.getElementById('beneficiariesCount');

        if (volunteersCountField) volunteersCountField.value = savedStats.volunteersCount || 200;
        if (volunteerHoursField) volunteerHoursField.value = savedStats.volunteerHours || 3200;
        if (placesCountField) placesCountField.value = savedStats.placesCount || 600;
        if (beneficiariesCountField) beneficiariesCountField.value = savedStats.beneficiariesCount || 8040;
    }

    // Statistics form handler
    document.getElementById('statsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitBtn = this.querySelector('[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        submitBtn.disabled = true;

        const volunteersCountField = document.getElementById('volunteersCount');
        const volunteerHoursField = document.getElementById('volunteerHours');
        const placesCountField = document.getElementById('placesCount');
        const beneficiariesCountField = document.getElementById('beneficiariesCount');

        const statsData = {
            volunteersCount: parseInt(volunteersCountField ? volunteersCountField.value : 200),
            volunteerHours: parseInt(volunteerHoursField ? volunteerHoursField.value : 3200),
            placesCount: parseInt(placesCountField ? placesCountField.value : 600),
            beneficiariesCount: parseInt(beneficiariesCountField ? beneficiariesCountField.value : 8040),
            lastUpdated: new Date().toISOString(),
            updatedBy: currentSession ? currentSession.fullName : 'مدير النظام'
        };

        setTimeout(() => {
            localStorage.setItem('warithStats', JSON.stringify(statsData));
            
            // Trigger update event for main page
            window.dispatchEvent(new CustomEvent('statsUpdated', { detail: statsData }));
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            showNotification('تم تحديث الإحصائيات بنجاح!', 'success');
            logActivity('stats_updated', 'تم تحديث إحصائيات الموقع');
        }, 1000);
    });

    function updateMainPageStats(stats) {
        // Update statistics on main page (if exists)
        // This part might need a more robust implementation depending on how the main page is structured
        console.log("Updating main page stats:", stats);
    }

    // Partners Management
    function loadCurrentPartners() {
        const savedPartners = JSON.parse(localStorage.getItem('warithPartners') || '[]');
        displayPartnersList(savedPartners);
    }

    function displayPartnersList(partners) {
        const partnersList = document.getElementById('partnersList');
        if (!partnersList) return;

        partnersList.innerHTML = partners.map((partner, index) => `
            <div class="partner-card">
                <div class="partner-icon">${partner.icon}</div>
                <div class="partner-name">${partner.name}</div>
                <div class="partner-actions">
                    <button class="btn-icon edit" onclick="editPartner(${index})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deletePartner(${index})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Partners form handler
    document.getElementById('partnersForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const partnerNameField = document.getElementById('partnerName');
        const partnerIconField = document.getElementById('partnerIcon');
        const submitButton = this.querySelector('[type="submit"]');

        const partnerName = partnerNameField ? partnerNameField.value.trim() : '';
        const partnerIcon = partnerIconField ? partnerIconField.value : '';

        if (!partnerName || !partnerIcon) {
            showNotification('يرجى ملء جميع الحقول', 'error');
            return;
        }

        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        submitButton.disabled = true;

        setTimeout(() => {
            const savedPartners = JSON.parse(localStorage.getItem('warithPartners') || '[]');
            const editIndex = submitButton ? parseInt(submitButton.getAttribute('data-partner-index')) : NaN;

            if (!isNaN(editIndex) && editIndex >= 0 && editIndex < savedPartners.length) {
                // Update existing partner
                const oldName = savedPartners[editIndex].name;
                savedPartners[editIndex] = {
                    ...savedPartners[editIndex],
                    name: partnerName,
                    icon: partnerIcon,
                    updatedAt: new Date().toISOString()
                };
                logActivity('partner_updated', `تم تحديث الشريك: ${oldName} إلى ${partnerName}`);
                showNotification('تم تحديث الشريك بنجاح!', 'success');
            } else {
                // Add new partner
                const newPartner = { 
                    id: Date.now(),
                    name: partnerName, 
                    icon: partnerIcon,
                    createdAt: new Date().toISOString(),
                    createdBy: currentSession ? currentSession.fullName : 'مدير النظام'
                };
                savedPartners.push(newPartner);
                logActivity('partner_added', `تم إضافة شريك جديد: ${partnerName}`);
                showNotification('تم إضافة الشريك بنجاح!', 'success');
            }

            localStorage.setItem('warithPartners', JSON.stringify(savedPartners));
            
            // Trigger update event for main page
            window.dispatchEvent(new CustomEvent('partnersUpdated', { detail: savedPartners }));
            
            displayPartnersList(savedPartners);
            this.reset();

            // Reset submit button text and remove edit index attribute
            submitButton.innerHTML = '<i class="fas fa-plus"></i> إضافة شريك';
            submitButton.removeAttribute('data-partner-index');
            submitButton.disabled = false;
        }, 1000);
    });

    window.deletePartner = function(index) {
        if (!confirm('هل أنت متأكد من حذف هذا الشريك؟')) return;

        const savedPartners = JSON.parse(localStorage.getItem('warithPartners') || '[]');
        const partnerName = savedPartners[index] ? savedPartners[index].name : 'شريك';

        savedPartners.splice(index, 1);
        localStorage.setItem('warithPartners', JSON.stringify(savedPartners));

        displayPartnersList(savedPartners);
        updateMainPagePartners(savedPartners);

        showNotification('تم حذف الشريك بنجاح', 'success');
        logActivity('partner_deleted', `تم حذف الشريك: ${partnerName}`);
    };

    // Function to edit partner
    window.editPartner = function(index) {
        const savedPartners = JSON.parse(localStorage.getItem('warithPartners') || '[]');
        const partner = savedPartners[index];

        if (partner) {
            const partnerNameField = document.getElementById('partnerName');
            const partnerIconField = document.getElementById('partnerIcon');

            if (partnerNameField) partnerNameField.value = partner.name;
            if (partnerIconField) partnerIconField.value = partner.icon;

            // Change form behavior to update instead of add
            const partnersForm = document.getElementById('partnersForm');
            const submitButton = partnersForm ? partnersForm.querySelector('[type="submit"]') : null;
            if (submitButton) {
                submitButton.innerHTML = '<i class="fas fa-save"></i> تحديث الشريك';
                submitButton.setAttribute('data-partner-index', index); // Store index for update
            }
            showNotification('تم تحميل بيانات الشريك للتعديل', 'info');
        }
    };

    function updateMainPagePartners(partners) {
        // Update partners on main page (if exists)
        console.log("Updating main page partners:", partners);
    }

    // Content Management
    function loadCurrentContent() {
        const savedContent = JSON.parse(localStorage.getItem('warithContent') || '{}');

        const aboutTitleField = document.getElementById('aboutTitle');
        const aboutTextField = document.getElementById('aboutText');
        const visionTextField = document.getElementById('visionText');
        const missionTextField = document.getElementById('missionText');
        const heroTextField = document.getElementById('heroText');

        if (aboutTitleField) aboutTitleField.value = savedContent.aboutTitle || 'وريث';
        if (aboutTextField) aboutTextField.value = savedContent.aboutText || 'انطلقت مسيرة فريقنا منذ عام 2021 م...';
        if (visionTextField) visionTextField.value = savedContent.visionText || 'أن نكون الفريق الرائد...';
        if (missionTextField) missionTextField.value = savedContent.missionText || 'نعمل على توثيق التراث السعودي ونشره';
        if (heroTextField) heroTextField.value = savedContent.heroText || 'حياكم الله في وريث';
    }

    // Content tabs functionality
    const contentTabs = document.querySelectorAll('[data-content-tab]');
    contentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            contentTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Hide all content
            document.querySelectorAll('.content-tab-content').forEach(content => {
                content.style.display = 'none';
            });

            // Show selected content
            const tabId = this.getAttribute('data-content-tab');
            const contentElement = document.getElementById(tabId + 'Content');
            if (contentElement) contentElement.style.display = 'block';
        });
    });

    // Content forms handlers
    ['about', 'vision', 'mission', 'hero'].forEach(section => {
        const form = document.getElementById(section + 'Form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                const submitBtn = this.querySelector('[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    const savedContent = JSON.parse(localStorage.getItem('warithContent') || '{}');

                    if (section === 'about') {
                        const aboutTitleField = document.getElementById('aboutTitle');
                        const aboutTextField = document.getElementById('aboutText');
                        if (aboutTitleField) savedContent.aboutTitle = aboutTitleField.value.trim();
                        if (aboutTextField) savedContent.aboutText = aboutTextField.value.trim();
                    } else if (section === 'vision') {
                        const visionTextField = document.getElementById('visionText');
                        if (visionTextField) savedContent.visionText = visionTextField.value.trim();
                    } else if (section === 'mission') {
                        const missionTextField = document.getElementById('missionText');
                        if (missionTextField) savedContent.missionText = missionTextField.value.trim();
                    } else if (section === 'hero') {
                        const heroTextField = document.getElementById('heroText');
                        if (heroTextField) savedContent.heroText = heroTextField.value.trim();
                    }

                    savedContent.lastUpdated = new Date().toISOString();
                    savedContent.updatedBy = currentSession ? currentSession.fullName : 'مدير النظام';
                    localStorage.setItem('warithContent', JSON.stringify(savedContent));

                    // Trigger update event for main page
                    window.dispatchEvent(new CustomEvent('contentUpdated', { detail: savedContent }));

                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;

                    const sectionNames = {
                        'about': 'معلومات الفريق',
                        'vision': 'الرؤية',
                        'mission': 'الرسالة',
                        'hero': 'النص الترحيبي'
                    };

                    showNotification(`تم تحديث ${sectionNames[section]} بنجاح!`, 'success');
                    logActivity('content_updated', `تم تحديث محتوى: ${sectionNames[section]}`);
                }, 1000);
            });
        }
    });

    function updateMainPageContent(content) {
        // Update content on main page (if exists)
        console.log("Updating main page content:", content);
    }

    // Site Settings
    function loadSiteSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('warithSettings') || '{}');

        const siteTitleField = document.getElementById('siteTitle');
        const siteSubtitleField = document.getElementById('siteSubtitle');
        const contactEmailField = document.getElementById('contactEmail');
        const contactPhoneField = document.getElementById('contactPhone');
        const maintenanceModeField = document.getElementById('maintenanceMode');

        if (siteTitleField) siteTitleField.value = savedSettings.siteTitle || 'وريث - فريق تطوعي';
        if (siteSubtitleField) siteSubtitleField.value = savedSettings.siteSubtitle || 'إرث باقٍ وتاريخ حي';
        if (contactEmailField) contactEmailField.value = savedSettings.contactEmail || 'Wareethofficial@gmail.com';
        if (contactPhoneField) contactPhoneField.value = savedSettings.contactPhone || '+966 59 511 4884';
        if (maintenanceModeField) maintenanceModeField.value = savedSettings.maintenanceMode || 'false';
    }

    // Settings form handler
    document.getElementById('settingsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const siteTitleField = document.getElementById('siteTitle');
        const siteSubtitleField = document.getElementById('siteSubtitle');
        const contactEmailField = document.getElementById('contactEmail');
        const contactPhoneField = document.getElementById('contactPhone');
        const maintenanceModeField = document.getElementById('maintenanceMode');

        const settingsData = {
            siteTitle: siteTitleField ? siteTitleField.value : '',
            siteSubtitle: siteSubtitleField ? siteSubtitleField.value : '',
            contactEmail: contactEmailField ? contactEmailField.value : '',
            contactPhone: contactPhoneField ? contactPhoneField.value : '',
            maintenanceMode: maintenanceModeField ? maintenanceModeField.value : 'false',
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('warithSettings', JSON.stringify(settingsData));
        updateMainPageSettings(settingsData);

        showNotification('تم حفظ إعدادات الموقع بنجاح!', 'success');
        logActivity('settings_updated', 'تم تحديث إعدادات الموقع');
    });

    function updateMainPageSettings(settings) {
        // Update settings on main page (if exists)
        console.log("Updating main page settings:", settings);
    }

    // Articles Publishing Functions
    function loadPublishedArticles() {
        const publishedArticlesList = document.getElementById('publishedArticlesList');
        if (!publishedArticlesList) return;

        const savedArticles = JSON.parse(localStorage.getItem('warithArticles') || '[]');

        publishedArticlesList.innerHTML = savedArticles.map(article => `
            <div class="article-admin-item" data-article-id="${article.id}">
                <div class="article-admin-header">
                    <h4>${article.title}</h4>
                    <div class="article-admin-actions">
                        <button class="btn-icon edit" onclick="editArticle(${article.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteArticle(${article.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="article-admin-meta">
                    <span class="article-admin-author">بقلم: ${article.author}</span>
                    <span class="article-admin-date">${article.date}</span>
                    <span class="category">${getCategoryName(article.category)}</span>
                </div>
                <p class="article-admin-summary">${article.summary}</p>
                ${article.tags ? `<div class="article-tags">الكلمات المفتاحية: ${article.tags}</div>` : ''}
            </div>
        `).join('');
    }

    function getCategoryName(category) {
        const categories = {
            'heritage': 'تراث',
            'culture': 'ثقافة',
            'history': 'تاريخ',
            'arts': 'فنون',
            'literature': 'أدب',
            'general': 'عام'
        };
        return categories[category] || category;
    }

    // Article form handling
    const articleForm = document.getElementById('articleForm');
    const articleImageInput = document.getElementById('articleImage');
    const articleImagePreview = document.getElementById('articleImagePreview');
    const previewArticleImg = document.getElementById('previewArticleImg');
    const resetArticleForm = document.getElementById('resetArticleForm');

    if (articleImageInput && articleImagePreview && previewArticleImg) {
        articleImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewArticleImg.src = e.target.result;
                    articleImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                articleImagePreview.style.display = 'none';
            }
        });
    }

    if (resetArticleForm) {
        resetArticleForm.addEventListener('click', function() {
            if (confirm('هل أنت متأكد من إعادة تعيين النموذج؟ ستفقد جميع البيانات المدخلة.')) {
                articleForm.reset();
                if (articleImagePreview) articleImagePreview.style.display = 'none';
                
                // Reset submit button if in edit mode
                const submitBtn = articleForm.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> نشر المقال';
                    submitBtn.removeAttribute('data-edit-id');
                }
            }
        });
    }

    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(e.target);

            // Validate form data
            if (!validateArticleForm(formData)) {
                return;
            }

            const submitBtn = articleForm.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري النشر...';
            submitBtn.disabled = true;

            const imageFile = formData.get('articleImage');

            const processArticleData = (imageDataUrl = null) => {
                const articleData = {
                    id: Date.now(),
                    title: formData.get('articleTitle'),
                    author: formData.get('articleAuthor'),
                    category: formData.get('articleCategory'),
                    summary: formData.get('articleSummary'),
                    content: formData.get('articleContent'),
                    tags: formData.get('articleTags'),
                    date: new Date().toLocaleDateString('ar-SA'),
                    status: 'published',
                    image: imageDataUrl,
                    createdAt: new Date().toISOString(),
                    publishedBy: currentSession ? currentSession.fullName : 'إدارة الموقع'
                };

                // Save to localStorage
                const existingArticles = JSON.parse(localStorage.getItem('warithArticles') || '[]');

                // Check if we are editing an existing article
                const editId = submitBtn.getAttribute('data-edit-id');
                if (editId) {
                    const articleIndex = existingArticles.findIndex(article => article.id == editId);
                    if (articleIndex !== -1) {
                        // Update existing article
                        articleData.id = parseInt(editId);
                        articleData.createdAt = existingArticles[articleIndex].createdAt;
                        articleData.updatedAt = new Date().toISOString();
                        existingArticles[articleIndex] = articleData;
                        logActivity('article_updated', `تم تحديث المقال: ${articleData.title}`);
                    } else {
                        existingArticles.unshift(articleData);
                        logActivity('article_published', `تم نشر مقال جديد: ${articleData.title}`);
                    }
                    submitBtn.removeAttribute('data-edit-id');
                } else {
                    // Add as new article
                    existingArticles.unshift(articleData);
                    logActivity('article_published', `تم نشر مقال جديد: ${articleData.title}`);
                }

                localStorage.setItem('warithArticles', JSON.stringify(existingArticles));

                // Reset form
                e.target.reset();
                if (articleImagePreview) articleImagePreview.style.display = 'none';

                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Show success message
                showNotification(`تم ${editId ? 'تحديث' : 'نشر'} المقال بنجاح!`, 'success');

                // Refresh published articles display
                loadPublishedArticles();

                // Update articles stats
                updateArticleStats(existingArticles);
            };

            // Handle image upload
            if (imageFile && imageFile.size > 0) {
                if (imageFile.size > 5 * 1024 * 1024) {
                    showNotification('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                if (!imageFile.type.startsWith('image/')) {
                    showNotification('يرجى اختيار ملف صورة صحيح', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    processArticleData(e.target.result);
                };
                reader.onerror = function() {
                    showNotification('حدث خطأ في قراءة الصورة', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                };
                reader.readAsDataURL(imageFile);
            } else {
                const editId = submitBtn.getAttribute('data-edit-id');
                if (editId) {
                    const existingArticles = JSON.parse(localStorage.getItem('warithArticles') || '[]');
                    const articleToEdit = existingArticles.find(a => a.id == editId);
                    if (articleToEdit && articleToEdit.image) {
                        processArticleData(articleToEdit.image);
                    } else {
                        processArticleData();
                    }
                } else {
                    processArticleData();
                }
            }
        });
    }

    function validateArticleForm(formData) {
        let isValid = true;
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());

        const requiredFields = {
            'articleAuthor': 'اسم الكاتب مطلوب',
            'articleTitle': 'عنوان المقال مطلوب',
            'articleCategory': 'التصنيف مطلوب',
            'articleSummary': 'ملخص المقال مطلوب',
            'articleContent': 'محتوى المقال مطلوب'
        };

        for (const [fieldName, errorMessage] of Object.entries(requiredFields)) {
            if (!formData.get(fieldName) || formData.get(fieldName).trim() === '') {
                showFieldError(fieldName, errorMessage);
                isValid = false;
            }
        }

        return isValid;
    }

    // Global functions for article management
    window.editArticle = function(articleId) {
        const savedArticles = JSON.parse(localStorage.getItem('warithArticles') || '[]');
        const article = savedArticles.find(a => a.id == articleId);

        if (article) {
            // Fill form with article data
            const articleAuthorField = document.getElementById('articleAuthor');
            const articleTitleField = document.getElementById('articleTitle');
            const articleCategoryField = document.getElementById('articleCategory');
            const articleSummaryField = document.getElementById('articleSummary');
            const articleContentField = document.getElementById('articleContent');
            const articleTagsField = document.getElementById('articleTags');

            if (articleAuthorField) articleAuthorField.value = article.author;
            if (articleTitleField) articleTitleField.value = article.title;
            if (articleCategoryField) articleCategoryField.value = article.category;
            if (articleSummaryField) articleSummaryField.value = article.summary;
            if (articleContentField) articleContentField.value = article.content;
            if (articleTagsField) articleTagsField.value = article.tags || '';

            // Show image preview if exists
            if (article.image && articleImagePreview && previewArticleImg) {
                previewArticleImg.src = article.image;
                articleImagePreview.style.display = 'block';
            }

            // Change form to edit mode
            const submitBtn = articleForm.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> تحديث المقال';
                submitBtn.setAttribute('data-edit-id', articleId);
            }

            // Scroll to form
            document.getElementById('articleForm').scrollIntoView({ behavior: 'smooth' });

            showNotification('تم تحميل بيانات المقال للتعديل', 'info');
        }
    };

    window.deleteArticle = function(articleId) {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

        const savedArticles = JSON.parse(localStorage.getItem('warithArticles') || '[]');
        const articleIndex = savedArticles.findIndex(article => article.id == articleId);

        if (articleIndex !== -1) {
            const deletedArticle = savedArticles[articleIndex];
            savedArticles.splice(articleIndex, 1);
            localStorage.setItem('warithArticles', JSON.stringify(savedArticles));

            // Log activity
            logActivity('article_deleted', `تم حذف المقال: ${deletedArticle.title}`);

            // Refresh display
            loadPublishedArticles();

            // Update stats
            updateArticleStats(savedArticles);

            showNotification('تم حذف المقال بنجاح', 'success');
        }
    };

    function updateArticleStats(articles) {
        // Update article statistics (placeholder)
        console.log("Updating article stats:", articles);
        const totalArticles = articles.length;
        const pendingArticles = articles.filter(a => a.status === 'pending').length;

        const totalArticlesElement = document.getElementById('totalArticles');
        const pendingArticlesElement = document.getElementById('pendingArticles');

        if (totalArticlesElement) totalArticlesElement.textContent = totalArticles;
        if (pendingArticlesElement) pendingArticlesElement.textContent = pendingArticles;
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none !important;
        }

        .submit-btn .fa-spinner {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Helper functions
    function loadSampleMembers() {
        const sampleMembers = [
            {
                id: 1,
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                role: 'admin',
                joinDate: '2023-01-15',
                status: 'active',
                phone: '+966501234567'
            },
            {
                id: 2,
                name: 'فاطمة علي',
                email: 'fatima@example.com',
                role: 'writer',
                joinDate: '2023-03-20',
                status: 'active',
                phone: '+966507654321'
            },
            {
                id: 3,
                name: 'خالد الأحمد',
                email: 'khalid@example.com',
                role: 'member',
                joinDate: '2023-06-10',
                status: 'inactive',
                phone: '+966509876543'
            }
        ];

        displayMembers(sampleMembers);
        updateMembersStats(sampleMembers);
    }

    function displayMembers(members) {
        const tableBody = document.getElementById('membersTableBody');
        if (!tableBody) return;

        if (members.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">لا يوجد أعضاء مسجلين</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td><span class="role ${member.role}">${getRoleText(member.role)}</span></td>
                <td>${member.joinDate}</td>
                <td><span class="status ${member.status}">${getStatusText(member.status)}</span></td>
                <td class="actions">
                    <button class="btn-icon edit" title="تعديل" onclick="editMember(${member.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" title="حذف" onclick="confirmDeleteMember(${member.id}, '${member.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function getRoleText(role) {
        const roleTexts = {
            'admin': 'مدير',
            'member': 'عضو',
            'writer': 'كاتب'
        };
        return roleTexts[role] || role;
    }

    function getStatusText(status) {
        const statusTexts = {
            'active': 'نشط',
            'inactive': 'غير نشط'
        };
        return statusTexts[status] || status;
    }

    function updateMembersStats(members) {
        const totalMembers = members.length;
        const activeMembers = members.filter(m => m.status === 'active').length;

        const totalMembersElement = document.getElementById('totalMembers');
        const activeMembersElement = document.getElementById('activeMembers');

        if (totalMembersElement) totalMembersElement.textContent = totalMembers;
        if (activeMembersElement) activeMembersElement.textContent = activeMembers;
    }

    function updateArticleStats(articles) {
        console.log('Updating article stats:', articles);

        const totalArticles = articles.length;
        const pendingArticles = articles.filter(a => a.status === 'pending').length;

        const totalArticlesElement = document.getElementById('totalArticles');
        const pendingArticlesElement = document.getElementById('pendingArticles');

        if (totalArticlesElement) totalArticlesElement.textContent = totalArticles;
        if (pendingArticlesElement) pendingArticlesElement.textContent = pendingArticles;
    }

    function confirmDeleteMember(memberId, memberName) {
        if (confirm(`هل أنت متأكد من حذف العضو "${memberName}"؟`)) {
            deleteMember(memberId);
        }
    }

    function editMember(memberId) {
        showNotification('ميزة تعديل الأعضاء ستكون متاحة قريباً', 'info');
    }

    function loadRecentActivities() {
        // This function will load recent activities when implemented
        console.log('Loading recent activities...');
    }

    function showExportOptions() {
        showNotification('ميزة تصدير البيانات ستكون متاحة قريباً', 'info');
    }

    function loadArticles(status) {
        const articlesList = document.getElementById('articlesList');
        if (!articlesList) return;

        articlesList.innerHTML = '<p>جاري تحميل المقالات...</p>';

        setTimeout(() => {
            articlesList.innerHTML = '<p>لا توجد مقالات متاحة حالياً</p>';
        }, 1000);
    }

    function loadPublishedNews() {
        console.log('Loading published news...');
    }

    function loadCurrentStats() {
        console.log('Loading current stats...');
    }

    function loadCurrentPartners() {
        console.log('Loading current partners...');
    }

    function hideAllSections() {
        const sections = ['statsManagement', 'partnersManagement', 'contentManagement', 'siteSettings'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'none';
        });

        const membersSection = document.querySelector('.members-section');
        if (membersSection) membersSection.style.display = 'block';
    }

    // Global functions for window scope
    window.confirmDeleteMember = confirmDeleteMember;
    window.editMember = editMember;
    window.deleteMember = deleteMember;

});