
document.addEventListener('DOMContentLoaded', function() {
    // Load published articles from admin system
    loadPublishedArticles();
    
    // Listen for updates from admin system
    window.addEventListener('storage', function(e) {
        if (e.key === 'publishedArticles') {
            loadPublishedArticles();
        }
    });
    
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter articles
            const articleCards = document.querySelectorAll('.article-card');
            articleCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// Load published articles from admin system
function loadPublishedArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    if (!articlesGrid) return;
    
    // Get articles from admin system
    const publishedArticles = JSON.parse(localStorage.getItem('warithArticles') || '[]');
    
    if (publishedArticles.length > 0) {
        // Clear existing sample articles and replace with published ones
        articlesGrid.innerHTML = '';
        
        publishedArticles.forEach(article => {
            const articleElement = createArticleElement(article);
            articlesGrid.appendChild(articleElement);
        });
        
        console.log('Loaded', publishedArticles.length, 'published articles');
    } else {
        console.log('No published articles found, keeping sample articles');
    }
}

// Function to create article element
function createArticleElement(data) {
    const article = document.createElement('article');
    article.className = 'article-card';
    article.setAttribute('data-category', data.category);
    
    const categoryNames = {
        'folk-heritage': 'التراث الشعبي',
        'historical-sites': 'المواقع التاريخية',
        'heritage-figures': 'الشخصيات التراثية',
        'traditional-arts': 'الفنون التقليدية',
        'research-studies': 'الأبحاث والدراسات',
        'wareeth-news': 'أخبار وريث',
        // الاحتفاظ بالتصنيفات القديمة للتوافق مع المقالات المنشورة سابقاً
        'heritage': 'التراث والثقافة',
        'culture': 'ثقافة', 
        'history': 'التاريخ',
        'arts': 'فنون',
        'literature': 'أدب',
        'general': 'عام',
        'technology': 'التقنية والابتكار',
        'crafts': 'الحرف اليدوية',
        'society': 'المجتمع والتطوع'
    };
    
    const tags = data.tags ? data.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : '';
    
    // Handle different author field names for compatibility
    const authorName = data.author || data.authorName || 'مؤلف مجهول';
    
    article.innerHTML = `
        ${data.image ? `<div class="article-image"><img src="${data.image}" alt="${data.title}" loading="lazy"></div>` : ''}
        <div class="article-content">
            <div class="article-meta">
                <span class="category ${data.category}">${categoryNames[data.category] || data.category}</span>
                <span class="date">${data.date}</span>
            </div>
            <h3>${data.title}</h3>
            <p class="article-summary">${data.summary}</p>
            <div class="article-footer">
                <div class="author-info">
                    <i class="fas fa-user"></i>
                    <span>${authorName}</span>
                </div>
                ${tags ? `<div class="article-tags">${tags}</div>` : ''}
            </div>
            <a href="#" class="read-more" onclick="showFullArticle('${data.id || Date.now()}')">اقرأ المزيد</a>
        </div>
    `;
    
    return article;
}

// Function to show full article content
function showFullArticle(articleId) {
    const publishedArticles = JSON.parse(localStorage.getItem('warithArticles') || '[]');
    const article = publishedArticles.find(a => a.id == articleId);
    
    if (article) {
        // Create modal to show full article
        const modal = document.createElement('div');
        modal.className = 'article-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${article.title}</h2>
                    <button class="close-modal" onclick="this.closest('.article-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="article-meta">
                        <span>بقلم: ${article.author}</span>
                        <span>تاريخ النشر: ${article.date}</span>
                    </div>
                    ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width: 100%; max-width: 500px; border-radius: 10px; margin: 1rem 0;">` : ''}
                    <div class="article-content">
                        ${article.content.replace(/\n/g, '<br>')}
                    </div>
                    ${article.tags ? `<div class="article-tags">الكلمات المفتاحية: ${article.tags}</div>` : ''}
                </div>
            </div>
        `;
        
        // Add styles for modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 2rem;
        `;
        
        modal.querySelector('.modal-content').style.cssText = `
            background: white;
            border-radius: 15px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            width: 100%;
        `;
        
        modal.querySelector('.modal-header').style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #eee;
        `;
        
        modal.querySelector('.modal-body').style.cssText = `
            padding: 2rem;
            line-height: 1.8;
        `;
        
        modal.querySelector('.close-modal').style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        `;
        
        document.body.appendChild(modal);
    }
}

// Function to show success message
function showSuccessMessage() {
    // Create success message if it doesn't exist
    let successMessage = document.querySelector('.success-message');
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            تم نشر المقال بنجاح! شكراً لمساهمتك في إثراء المحتوى.
        `;
        
        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(successMessage, formContainer.querySelector('.article-form'));
    }
    
    successMessage.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Add fade in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
