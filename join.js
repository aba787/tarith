
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
    
    // Join form handling
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(joinForm);
            const data = Object.fromEntries(formData);
            
            // Get selected interests
            const interests = [];
            const interestCheckboxes = document.querySelectorAll('input[name="interests[]"]:checked');
            interestCheckboxes.forEach(checkbox => {
                interests.push(checkbox.value);
            });
            data.interests = interests;
            
            // Simple validation
            if (!validateJoinForm(data)) {
                return;
            }
            
            // Process the application
            processJoinApplication(data);
        });
    }
    
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
    document.querySelectorAll('.benefit-card, .step, .form-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form validation function
function validateJoinForm(data) {
    let isValid = true;
    
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());
    
    // Check required fields
    const requiredFields = [
        { field: 'firstName', message: 'الاسم الأول مطلوب' },
        { field: 'lastName', message: 'الاسم الأخير مطلوب' },
        { field: 'email', message: 'البريد الإلكتروني مطلوب' },
        { field: 'phone', message: 'رقم الجوال مطلوب' },
        { field: 'age', message: 'العمر مطلوب' },
        { field: 'city', message: 'المدينة مطلوبة' },
        { field: 'education', message: 'المؤهل العلمي مطلوب' },
        { field: 'profession', message: 'المهنة مطلوبة' },
        { field: 'motivation', message: 'دافع الانضمام مطلوب' },
        { field: 'availability', message: 'مدى التوفر مطلوب' }
    ];
    
    requiredFields.forEach(item => {
        if (!data[item.field] || data[item.field].trim() === '') {
            showError(item.field, item.message);
            isValid = false;
        }
    });
    
    // Validate email
    if (data.email && !isValidEmail(data.email)) {
        showError('email', 'البريد الإلكتروني غير صحيح');
        isValid = false;
    }
    
    // Validate phone
    if (data.phone && !isValidPhone(data.phone)) {
        showError('phone', 'رقم الجوال غير صحيح');
        isValid = false;
    }
    
    // Validate age
    if (data.age && (data.age < 18 || data.age > 80)) {
        showError('age', 'العمر يجب أن يكون بين 18 و 80 سنة');
        isValid = false;
    }
    
    // Check if at least one interest is selected
    if (!data.interests || data.interests.length === 0) {
        showError('interests', 'يجب اختيار مجال واحد على الأقل من مجالات الاهتمام');
        isValid = false;
    }
    
    // Check terms agreement
    if (!data.terms) {
        showError('terms', 'يجب الموافقة على شروط وأحكام الانضمام');
        isValid = false;
    }
    
    return isValid;
}

// Show error message
function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    let formGroup;
    if (fieldName === 'interests') {
        formGroup = document.querySelector('.checkbox-grid').parentNode;
    } else if (fieldName === 'terms') {
        formGroup = document.querySelector('#terms').closest('.checkbox-group');
    } else {
        formGroup = field.parentNode;
    }
    
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
    errorDiv.style.fontWeight = '600';
    errorDiv.textContent = message;
    
    formGroup.appendChild(errorDiv);
    
    if (field.tagName !== 'INPUT' || field.type !== 'checkbox') {
        field.style.borderColor = '#e74c3c';
    }
    
    // Smooth scroll to error field
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Process join application
function processJoinApplication(data) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        // Save application to localStorage (in real app, this would go to a server)
        saveJoinApplication(data);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        document.getElementById('joinForm').reset();
        
        // Reset submit button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Clear any error styles
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.style.borderColor = '';
        });
        
    }, 2000);
}

// Save join application
function saveJoinApplication(data) {
    // Get existing applications
    const existingApplications = JSON.parse(localStorage.getItem('joinApplications') || '[]');
    
    // Add timestamp and ID
    const application = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'pending',
        ...data
    };
    
    // Add to applications array
    existingApplications.push(application);
    
    // Save to localStorage
    localStorage.setItem('joinApplications', JSON.stringify(existingApplications));
    
    // Send email notification (simulate)
    sendEmailNotification(application);
}

// Simulate sending email notification
function sendEmailNotification(application) {
    // In a real application, this would send an actual email
    console.log('تم إرسال إشعار بريد إلكتروني للجمعية:', {
        to: 'membership@warith.com',
        subject: 'طلب انضمام جديد - جمعية وريث',
        applicant: `${application.firstName} ${application.lastName}`,
        email: application.email,
        phone: application.phone,
        interests: application.interests,
        motivation: application.motivation
    });
}

// Show success message
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
        <h3 style="margin-bottom: 1rem;">تم إرسال طلب الانضمام بنجاح!</h3>
        <p style="margin: 0; font-size: 1.1rem; line-height: 1.6;">
            شكراً لك على اهتمامك بالانضمام لجمعية وريث.<br>
            سيتم مراجعة طلبك من قبل لجنة العضوية وسنتواصل معك خلال 5-7 أيام عمل.<br>
            تحقق من بريدك الإلكتروني للحصول على تأكيد الاستلام.
        </p>
    `;
    
    // Insert before the form
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(successDiv, formContainer.firstChild);
    
    // Auto scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transform = 'translateY(-20px)';
        successDiv.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            successDiv.remove();
        }, 500);
    }, 10000);
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
