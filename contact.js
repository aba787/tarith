
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle (same as main site)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        if (hamburger) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }));
    
    // Header scroll effect
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
    
    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            if (!validateForm(data)) {
                return;
            }
            
            // Show success message (in real implementation, you would send this data to a server)
            showSuccessMessage();
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentNode;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current FAQ item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
    
    // Smooth animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.contact-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form validation function
function validateForm(data) {
    let isValid = true;
    
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());
    
    // Check required fields
    if (!data.firstName || data.firstName.trim() === '') {
        showError('firstName', 'الاسم الأول مطلوب');
        isValid = false;
    }
    
    if (!data.lastName || data.lastName.trim() === '') {
        showError('lastName', 'الاسم الأخير مطلوب');
        isValid = false;
    }
    
    if (!data.email || data.email.trim() === '') {
        showError('email', 'البريد الإلكتروني مطلوب');
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        showError('email', 'يرجى إدخال بريد إلكتروني صحيح');
        isValid = false;
    }
    
    if (!data.subject || data.subject.trim() === '') {
        showError('subject', 'الموضوع مطلوب');
        isValid = false;
    }
    
    if (!data.message || data.message.trim() === '') {
        showError('message', 'الرسالة مطلوبة');
        isValid = false;
    } else if (data.message.trim().length < 10) {
        showError('message', 'الرسالة يجب أن تكون أكثر من 10 أحرف');
        isValid = false;
    }
    
    // Validate phone if provided
    if (data.phone && data.phone.trim() && !isValidPhone(data.phone)) {
        showError('phone', 'رقم الهاتف غير صحيح');
        isValid = false;
    }
    
    if (!data.privacy) {
        showError('privacy', 'يجب الموافقة على سياسة الخصوصية');
        isValid = false;
    }
    
    return isValid;
}

// Show error message
function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    const formGroup = field.parentNode;
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.marginTop = '0.5rem';
    errorDiv.textContent = message;
    
    formGroup.appendChild(errorDiv);
    
    field.style.borderColor = '#e74c3c';
    
    // Smooth scroll to error field on mobile
    if (window.innerWidth <= 768) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    setTimeout(() => field.focus(), 100);
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (Saudi format)
function isValidPhone(phone) {
    const phoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}

// Show success message
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
        color: white;
        padding: 2rem 3rem;
        border-radius: 15px;
        box-shadow: 0 15px 35px rgba(39, 174, 96, 0.3);
        z-index: 10000;
        text-align: center;
        font-size: 1.2rem;
        font-weight: 600;
        max-width: 400px;
        width: 90%;
    `;
    
    successDiv.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
        <h3 style="margin-bottom: 0.5rem;">تم إرسال الرسالة بنجاح!</h3>
        <p style="margin: 0; opacity: 0.9;">سنتواصل معكم في أقرب وقت ممكن</p>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
        successDiv.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 4000);
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
    
    .success-message {
        animation: successPop 0.6s ease-out;
    }
    
    @keyframes successPop {
        0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.5);
        }
        100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
        }
    }
`;
document.head.appendChild(style);
