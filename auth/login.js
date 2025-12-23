// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const loginBtn = document.getElementById('loginBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    const sendResetLinkBtn = document.getElementById('sendResetLink');
    const resetEmailInput = document.getElementById('resetEmail');
    const googleLoginBtn = document.getElementById('googleLogin');
    const facebookLoginBtn = document.getElementById('facebookLogin');
    
    // Demo user credentials (for demo purposes only)
    const demoUsers = [
        { email: 'john@example.com', password: 'password123', name: 'John Smith' },
        { email: 'user@afrorhythm.com', password: 'AfroRhythm2023', name: 'Demo User' }
    ];
    
    // Show error message
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Show success message
    function showSuccess(message) {
        successText.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }
    
    // Validate email format
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Validate password strength
    function validatePassword(password) {
        return password.length >= 6;
    }
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Reset error state
        errorMessage.style.display = 'none';
        
        // Validate inputs
        if (!email) {
            showError('Please enter your email address');
            emailInput.focus();
            return;
        }
        
        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showError('Please enter your password');
            passwordInput.focus();
            return;
        }
        
        if (!validatePassword(password)) {
            showError('Password must be at least 6 characters long');
            passwordInput.focus();
            return;
        }
        
        // Show loading state
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
        loginBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Check demo credentials
            const user = demoUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Successful login
                showSuccess('Login successful! Redirecting to dashboard...');
                
                // Store user data in localStorage (for demo purposes)
                localStorage.setItem('afroUser', JSON.stringify({
                    email: user.email,
                    name: user.name,
                    isLoggedIn: true,
                    loginTime: new Date().toISOString()
                }));
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = '../fan.html';
                }, 2000);
            } else {
                // Failed login
                showError('Invalid email or password. Please try again.');
                
                // Reset button state
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
                
                // Shake animation for error
                loginForm.classList.add('shake');
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 500);
            }
        }, 1500);
    });
    
    // Forgot password link
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.show();
    });
    
    // Send reset link
    sendResetLinkBtn.addEventListener('click', function() {
        const email = resetEmailInput.value.trim();
        
        if (!email || !validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate sending reset link
        sendResetLinkBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        sendResetLinkBtn.disabled = true;
        
        setTimeout(() => {
            alert(`Password reset link has been sent to ${email}`);
            forgotPasswordModal.hide();
            sendResetLinkBtn.innerHTML = 'Send Reset Link';
            sendResetLinkBtn.disabled = false;
            resetEmailInput.value = '';
        }, 1500);
    });
    
    // Google login
    googleLoginBtn.addEventListener('click', function() {
        googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
        googleLoginBtn.disabled = true;
        
        setTimeout(() => {
            showSuccess('Google login would connect here. For demo, use email: john@example.com, password: password123');
            googleLoginBtn.innerHTML = '<i class="fab fa-google"></i><span>Google</span>';
            googleLoginBtn.disabled = false;
        }, 1500);
    });
    
    // Facebook login
    facebookLoginBtn.addEventListener('click', function() {
        facebookLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
        facebookLoginBtn.disabled = true;
        
        setTimeout(() => {
            showSuccess('Facebook login would connect here. For demo, use email: john@example.com, password: password123');
            facebookLoginBtn.innerHTML = '<i class="fab fa-facebook-f"></i><span>Facebook</span>';
            facebookLoginBtn.disabled = false;
        }, 1500);
    });
    
    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
    
    // Demo credentials hint
    console.log('Demo Credentials:');
    console.log('Email: john@example.com, Password: password123');
    console.log('Email: user@afrorhythm.com, Password: AfroRhythm2023');
});