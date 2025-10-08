document.addEventListener('DOMContentLoaded', function() {
    // Initialize IndexedDB for data storage
    let db;
    const dbRequest = indexedDB.open('WarithMembersDB', 1);
    
    dbRequest.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };
    
    dbRequest.onsuccess = function(event) {
        db = event.target.result;
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
    };

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
    }

    // Perform login actions
    function performLogin(sessionData) {
        loginSection.style.display = 'none';
        adminDashboard.style.display = 'block';
        document.getElementById('adminName').textContent = sessionData.fullName;
        
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
        logoutBtn.addEventListener('click', function() {
            performLogout();
        });
    }

    function performLogout() {
        if (currentSession) {
            logActivity('logout', `تسجيل خروج المستخدم: ${currentSession.fullName}`);
        }
        
        currentSession = null;
        localStorage.removeItem('warithSession');
        
        loginSection.style.display = 'block';
        adminDashboard.style.display = 'none';
        loginForm.reset();
        
        // Clear sensitive data
        clearDashboardData();
        
        showNotification('تم تسجيل الخروج بنجاح', 'info');
    }

    // Activity logging function
    function logActivity(type, description) {
        if (!db) return;
        
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

        closeModal.addEventListener('click', function() {
            addMemberModal.style.display = 'none';
        });

        cancelAdd.addEventListener('click', function() {
            addMemberModal.style.display = 'none';
        });

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
            membersSection.style.display = 'none';
            articlesManagement.style.display = 'block';
            loadArticles('published');
        });
    }

    if (backToMembers) {
        backToMembers.addEventListener('click', function() {
            articlesManagement.style.display = 'none';
            membersSection.style.display = 'block';
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

    // News management functionality
    const manageNewsBtn = document.getElementById('manageNewsBtn');
    const newsModal = document.getElementById('newsModal');
    const closeNewsModal = document.getElementById('closeNewsModal');
    
    if (manageNewsBtn && newsModal) {
        manageNewsBtn.addEventListener('click', function() {
            newsModal.style.display = 'block';
            loadPublishedNews();
        });

        closeNewsModal.addEventListener('click', function() {
            newsModal.style.display = 'none';
        });

        // Close modal on outside click
        window.addEventListener('click', function(event) {
            if (event.target === newsModal) {
                newsModal.style.display = 'none';
            }
        });
    }

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
    if (memberSearch) {
        memberSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performAdvancedSearch();
            }, 300);
        });
    }

    function performAdvancedSearch() {
        const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
        const roleFilter = document.getElementById('roleFilter').value;
        const rows = document.querySelectorAll('#membersTableBody tr');

        let visibleCount = 0;
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const email = row.cells[1].textContent.toLowerCase();
            const role = row.querySelector('.role').textContent.toLowerCase();

            const matchesSearch = !searchTerm || 
                name.includes(searchTerm) || 
                email.includes(searchTerm);
            const matchesRole = roleFilter === 'all' || role.includes(roleFilter);

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
        if (!searchTerm) return;
        
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
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'search-results-count';
            document.querySelector('.search-filter').appendChild(counter);
        }
        counter.textContent = `عُثر على ${count} نتيجة`;
    }

    function loadPublishedNews() {
        const publishedNewsList = document.getElementById('publishedNewsList');
        const savedNews = JSON.parse(localStorage.getItem('warithNews') || '[]');
        
        if (publishedNewsList) {
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
    }

    // Search and filter functionality
    const memberSearch = document.getElementById('memberSearch');
    const roleFilter = document.getElementById('roleFilter');

    if (memberSearch) {
        memberSearch.addEventListener('input', function() {
            filterMembers();
        });
    }

    if (roleFilter) {
        roleFilter.addEventListener('change', function() {
            filterMembers();
        });
    }

    // Member action buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-icon.edit')) {
            const row = e.target.closest('tr');
            editMember(row);
        }

        if (e.target.closest('.btn-icon.delete')) {
            const row = e.target.closest('tr');
            deleteMember(row);
        }
    });

    // Image preview handling
    const imageInput = document.getElementById('newsImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (imageInput) {
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
                existingNews.unshift(newsData);
                localStorage.setItem('warithNews', JSON.stringify(existingNews));

                // Log activity
                logActivity('news_published', `تم نشر خبر جديد: ${newsData.title}`);

                // Reset form
                e.target.reset();
                if (imagePreview) imagePreview.style.display = 'none';

                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Show success message
                showNotification('تم نشر الخبر بنجاح!', 'success');

                // Refresh published news display
                loadPublishedNews();
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
                processNewsData();
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
});

// Enhanced database functions
function saveMemberToDB(memberData) {
    if (!db) return Promise.reject('Database not available');
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['members'], 'readwrite');
        const store = transaction.objectStore('members');
        
        // Add timestamps and additional data
        memberData.createdAt = new Date().toISOString();
        memberData.updatedAt = new Date().toISOString();
        memberData.createdBy = currentSession ? currentSession.fullName : 'النظام';
        memberData.status = 'active';
        memberData.loginCount = 0;
        memberData.lastLogin = null;
        
        const request = store.add(memberData);
        
        request.onsuccess = function() {
            memberData.id = request.result;
            logActivity('member_added', `تم إضافة عضو جديد: ${memberData.name}`);
            resolve(memberData);
        };
        
        request.onerror = function() {
            reject('Error adding member to database');
        };
    });
}

function loadMembersFromDB() {
    if (!db) return;
    
    const transaction = db.transaction(['members'], 'readonly');
    const store = transaction.objectStore('members');
    const request = store.getAll();
    
    request.onsuccess = function() {
        const members = request.result;
        displayMembersInTable(members);
        updateMemberStats(members);
    };
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
function viewMemberDetails(memberId) {
    if (!db) return;
    
    const transaction = db.transaction(['members'], 'readonly');
    const store = transaction.objectStore('members');
    const request = store.get(memberId);
    
    request.onsuccess = function() {
        const member = request.result;
        if (member) {
            showMemberDetailsModal(member);
        }
    };
}

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
                        <span>${new Date(member.createdAt).toLocaleDateString('ar-SA')}</span>
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

function toggleMemberStatus(memberId) {
    if (!db) return;
    
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
}

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
    if (!db) return;
    
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
    if (!db) return;
    
    const transaction = db.transaction(['activities'], 'readonly');
    const store = transaction.objectStore('activities');
    const request = store.getAll();
    
    request.onsuccess = function() {
        const activities = request.result
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10); // Get last 10 activities
        
        displayRecentActivities(activities);
    };
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
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const rows = document.querySelectorAll('#membersTableBody tr');

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const email = row.cells[1].textContent.toLowerCase();
        const role = row.cells[2].textContent.toLowerCase();

        const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
        const matchesRole = roleFilter === 'all' || role.includes(roleFilter);

        if (matchesSearch && matchesRole) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Function to edit member
function editMember(row) {
    const name = row.cells[0].textContent;
    const email = row.cells[1].textContent;

    showNotification(`تحرير العضو: ${name} (${email})`, 'info');
    // Here you would open an edit modal with the member's data
}

// Function to delete member
function deleteMember(row) {
    const name = row.cells[0].textContent;

    if (confirm(`هل أنت متأكد من حذف العضو: ${name}؟`)) {
        row.remove();
        updateStatsAfterDelete();
        showNotification('تم حذف العضو بنجاح', 'success');
    }
}

// Function to update stats after delete
function updateStatsAfterDelete() {
    const totalMembers = document.getElementById('totalMembers');
    const activeMembers = document.getElementById('activeMembers');

    const currentTotal = parseInt(totalMembers.textContent);
    const currentActive = parseInt(activeMembers.textContent);

    totalMembers.textContent = Math.max(0, currentTotal - 1);
    activeMembers.textContent = Math.max(0, currentActive - 1);
}

// Enhanced export functions
function exportMembersData(format = 'csv') {
    if (!db) {
        showNotification('قاعدة البيانات غير متاحة', 'error');
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
}

function exportToCSV(members) {
    const csvContent = [
        'الرقم,الاسم,البريد الإلكتروني,الدور,رقم الهاتف,تاريخ الانضمام,الحالة,عدد تسجيلات الدخول,آخر دخول,أضيف بواسطة',
        ...members.map(member => [
            member.id,
            member.name,
            member.email,
            member.role,
            member.phone || '',
            new Date(member.createdAt).toLocaleDateString('ar-SA'),
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

function exportActivitiesData() {
    if (!db) {
        showNotification('قاعدة البيانات غير متاحة', 'error');
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
                activity.description,
                new Date(activity.timestamp).toLocaleString('ar-SA'),
                activity.user,
                activity.sessionId || ''
            ].join(','))
        ].join('\n');

        downloadFile(csvContent, 'warith_activities.csv', 'text/csv;charset=utf-8;');
        showNotification('تم تصدير سجل الأنشطة', 'success');
    };
}

function exportStatisticsReport() {
    if (!db) {
        showNotification('قاعدة البيانات غير متاحة', 'error');
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
}

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
        const joinMonth = new Date(member.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
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

// Enhanced member deletion with confirmation
function deleteMember(memberId) {
    if (!db) return;
    
    const transaction = db.transaction(['members'], 'readonly');
    const store = transaction.objectStore('members');
    const request = store.get(memberId);
    
    request.onsuccess = function() {
        const member = request.result;
        if (!member) return;
        
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal confirm-modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تأكيد الحذف</h3>
                </div>
                <div class="modal-body">
                    <p>هل أنت متأكد من حذف العضو <strong>${member.name}</strong>؟</p>
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
}

function confirmDelete(memberId) {
    const deleteTransaction = db.transaction(['members'], 'readwrite');
    const deleteStore = deleteTransaction.objectStore('members');
    
    deleteStore.get(memberId).onsuccess = function(event) {
        const member = event.target.result;
        
        deleteStore.delete(memberId).onsuccess = function() {
            logActivity('member_deleted', `تم حذف العضو: ${member.name}`);
            loadMembersFromDB();
            showNotification('تم حذف العضو بنجاح', 'success');
            document.querySelector('.confirm-modal').remove();
        };
    };
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
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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

        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
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
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Dummy functions to avoid errors if they are not defined elsewhere
function displayPublishedNews() {
    console.log("displayPublishedNews called");
}

function showMessage(message, type) {
    console.log(`showMessage called: ${message}, ${type}`);
    showNotification(message, type);
}