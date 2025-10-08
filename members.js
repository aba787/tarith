
document.addEventListener('DOMContentLoaded', function() {
    // Login functionality
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminDashboard = document.getElementById('adminDashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Sample credentials (in real app, this would be server-side)
    const credentials = {
        'admin': 'password123',
        'warith_admin': 'warith2023',
        'manager': 'manager123'
    };
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (credentials[username] && credentials[username] === password) {
                // Successful login
                loginSection.style.display = 'none';
                adminDashboard.style.display = 'block';
                document.getElementById('adminName').textContent = username;
                
                // Show success message
                showNotification('تم تسجيل الدخول بنجاح!', 'success');
            } else {
                // Failed login
                showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
            }
        });
    }
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            loginSection.style.display = 'block';
            adminDashboard.style.display = 'none';
            loginForm.reset();
            showNotification('تم تسجيل الخروج بنجاح', 'info');
        });
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
    
    // Add member form submission
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(addMemberForm);
            const memberData = {
                name: formData.get('memberName'),
                email: formData.get('memberEmail'),
                role: formData.get('memberRole'),
                phone: formData.get('memberPhone'),
                joinDate: new Date().toLocaleDateString('ar-SA'),
                status: 'active'
            };
            
            // Add member to table
            addMemberToTable(memberData);
            
            // Update stats
            updateStats();
            
            // Close modal and reset form
            addMemberModal.style.display = 'none';
            addMemberForm.reset();
            
            showNotification('تم إضافة العضو بنجاح!', 'success');
        });
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
    
    // Export data functionality
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            exportMembersData();
        });
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
});

// Function to add member to table
function addMemberToTable(memberData) {
    const tableBody = document.getElementById('membersTableBody');
    const row = document.createElement('tr');
    
    const roleNames = {
        'admin': 'مدير',
        'member': 'عضو',
        'writer': 'كاتب'
    };
    
    row.innerHTML = `
        <td>${memberData.name}</td>
        <td>${memberData.email}</td>
        <td><span class="role ${memberData.role}">${roleNames[memberData.role]}</span></td>
        <td>${memberData.joinDate}</td>
        <td><span class="status active">نشط</span></td>
        <td class="actions">
            <button class="btn-icon edit" title="تعديل">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
}

// Function to update statistics
function updateStats() {
    const totalMembers = document.getElementById('totalMembers');
    const activeMembers = document.getElementById('activeMembers');
    
    const currentTotal = parseInt(totalMembers.textContent);
    const currentActive = parseInt(activeMembers.textContent);
    
    totalMembers.textContent = currentTotal + 1;
    activeMembers.textContent = currentActive + 1;
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

// Function to export members data
function exportMembersData() {
    const rows = document.querySelectorAll('#membersTableBody tr');
    let csvContent = "الاسم,البريد الإلكتروني,الدور,تاريخ الانضمام,الحالة\n";
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = [
            cells[0].textContent,
            cells[1].textContent,
            cells[2].textContent.trim(),
            cells[3].textContent,
            cells[4].textContent.trim()
        ].join(',');
        csvContent += rowData + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'members_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('تم تصدير البيانات بنجاح', 'success');
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
