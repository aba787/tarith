
document.addEventListener('DOMContentLoaded', function() {
    // Article form submission
    const articleForm = document.getElementById('articleForm');
    const articlesGrid = document.getElementById('articlesGrid');
    
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(articleForm);
            const articleData = {
                authorName: formData.get('authorName'),
                authorEmail: formData.get('authorEmail'),
                title: formData.get('articleTitle'),
                category: formData.get('articleCategory'),
                summary: formData.get('articleSummary'),
                content: formData.get('articleContent'),
                tags: formData.get('articleTags'),
                date: new Date().toLocaleDateString('ar-SA')
            };
            
            // Create new article element
            const newArticle = createArticleElement(articleData);
            
            // Add to articles grid
            if (articlesGrid) {
                articlesGrid.insertBefore(newArticle, articlesGrid.firstChild);
            }
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            articleForm.reset();
            
            // Scroll to articles section
            document.querySelector('.articles-display').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter articles
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

// Function to create article element
function createArticleElement(data) {
    const article = document.createElement('article');
    article.className = 'article-card';
    article.setAttribute('data-category', data.category);
    
    const categoryNames = {
        'heritage': 'التراث والثقافة',
        'technology': 'التقنية والابتكار',
        'crafts': 'الحرف اليدوية',
        'history': 'التاريخ',
        'society': 'المجتمع والتطوع',
        'other': 'أخرى'
    };
    
    const tags = data.tags ? data.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : '';
    
    article.innerHTML = `
        <div class="article-meta">
            <span class="category ${data.category}">${categoryNames[data.category] || data.category}</span>
            <span class="date">${data.date}</span>
        </div>
        <h3>${data.title}</h3>
        <p class="article-summary">${data.summary}</p>
        <div class="article-footer">
            <div class="author-info">
                <i class="fas fa-user"></i>
                <span>${data.authorName}</span>
            </div>
            <div class="article-tags">
                ${tags}
            </div>
        </div>
        <a href="#" class="read-more">اقرأ المزيد</a>
    `;
    
    return article;
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
