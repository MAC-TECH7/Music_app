// Signup Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const signupForm = document.getElementById('signupForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthText = document.getElementById('strengthText');
    const strengthFill = document.getElementById('strengthFill');
    const agreeTermsCheck = document.getElementById('agreeTerms');
    const newsletterCheck = document.getElementById('newsletter');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const signupBtn = document.getElementById('signupBtn');
    const googleSignupBtn = document.getElementById('googleSignup');
    const facebookSignupBtn = document.getElementById('facebookSignup');
    
    // Password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        let tips = "";
        
        // Check password length
        if (password.length >= 8) {
            strength += 1;
        } else {
            tips += "Make the password at least 8 characters. ";
        }
        
        // Check for mixed case
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
            strength += 1;
        } else {
            tips += "Include both lowercase and uppercase letters. ";
        }
        
        // Check for numbers
        if (password.match(/\d/)) {
            strength += 1;
        } else {
            tips += "Include at least one number. ";
        }
        
        // Check for special characters
        if (password.match(/[^a-zA-Z\d]/)) {
            strength += 1;
        } else {
            tips += "Include at least one special character. ";
        }
        
        // Return results
        let strengthPercent = (strength / 4) * 100;
        let strengthLabel = "";
        let color = "";
        
        switch(strength) {
            case 0:
            case 1:
                strengthLabel = "Weak";
                color = "#ff6b6b";
                break;
            case 2:
                strengthLabel = "Fair";
                color = "#ffa726";
                break;
            case 3:
                strengthLabel = "Good";
                color = "#51cf66";
                break;
            case 4:
                strengthLabel = "Strong";
                color = "#2E8B57";
                break;
        }
        
        return {
            percent: strengthPercent,
            label: strengthLabel,
            color: color,
            tips: tips
        };
    }
    
    // Update password strength indicator
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        
        strengthFill.style.width = `${strength.percent}%`;
        strengthFill.style.background = strength.color;
        strengthText.textContent = `Password strength: ${strength.label}`;
        strengthText.style.color = strength.color;
    });
    
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
    
    // Validate phone number
    function validatePhone(phone) {
        if (!phone) return true; // Phone is optional
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    // Validate name
    function validateName(name) {
        return name.length >= 2;
    }
    
    // Validate location
    function validateLocation(location) {
        if (!location) return true; // Location is optional
        return location.length >= 2;
    }
    
    // Handle form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const location = locationInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Reset error state
        errorMessage.style.display = 'none';
        
        // Validate inputs
        if (!firstName) {
            showError('Please enter your first name');
            firstNameInput.focus();
            return;
        }
        
        if (!validateName(firstName)) {
            showError('First name must be at least 2 characters long');
            firstNameInput.focus();
            return;
        }
        
        if (!lastName) {
            showError('Please enter your last name');
            lastNameInput.focus();
            return;
        }
        
        if (!validateName(lastName)) {
            showError('Last name must be at least 2 characters long');
            lastNameInput.focus();
            return;
        }
        
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
        
        if (phone && !validatePhone(phone)) {
            showError('Please enter a valid phone number');
            phoneInput.focus();
            return;
        }
        
        if (location && !validateLocation(location)) {
            showError('Please enter a valid location');
            locationInput.focus();
            return;
        }
        
        if (!password) {
            showError('Please create a password');
            passwordInput.focus();
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            passwordInput.focus();
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            confirmPasswordInput.focus();
            return;
        }
        
        if (!agreeTermsCheck.checked) {
            showError('You must agree to the Terms of Service and Privacy Policy');
            return;
        }
        
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('afroUsers') || '[]');
        const userExists = existingUsers.some(user => user.email === email);
        
        if (userExists) {
            showError('An account with this email already exists');
            return;
        }
        
        // Show loading state
        const originalText = signupBtn.innerHTML;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
        signupBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Create new user object
            const newUser = {
                id: Date.now(),
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`,
                email: email,
                phone: phone || '',
                location: location || '',
                password: password, // In real app, this would be hashed
                newsletter: newsletterCheck.checked,
                createdAt: new Date().toISOString(),
                role: 'fan'
            };
            
            // Save to localStorage (for demo purposes)
            existingUsers.push(newUser);
            localStorage.setItem('afroUsers', JSON.stringify(existingUsers));
            
            // Also set as current user
            localStorage.setItem('afroUser', JSON.stringify({
                email: newUser.email,
                name: newUser.fullName,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            }));
            
            // Show success message
            showSuccess('Account created successfully! Redirecting to dashboard...');
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                window.location.href = '../fan.html';
            }, 3000);
        }, 2000);
    });
    
    // Google signup
    googleSignupBtn.addEventListener('click', function() {
        googleSignupBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
        googleSignupBtn.disabled = true;
        
        setTimeout(() => {
            showSuccess('Google signup would connect here. Please use the form above for demo.');
            googleSignupBtn.innerHTML = '<i class="fab fa-google"></i><span>Google</span>';
            googleSignupBtn.disabled = false;
        }, 1500);
    });
    
    // Facebook signup
    facebookSignupBtn.addEventListener('click', function() {
        facebookSignupBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
        facebookSignupBtn.disabled = true;
        
        setTimeout(() => {
            showSuccess('Facebook signup would connect here. Please use the form above for demo.');
            facebookSignupBtn.innerHTML = '<i class="fab fa-facebook-f"></i><span>Facebook</span>';
            facebookSignupBtn.disabled = false;
        }, 1500);
    });
    
    // Auto-fill demo data for testing
    function fillDemoData() {
        firstNameInput.value = 'John';
        lastNameInput.value = 'Smith';
        emailInput.value = 'john@example.com';
        phoneInput.value = '+237 612345678';
        locationInput.value = 'Yaoundé, Cameroon';
        passwordInput.value = 'AfroRhythm2023';
        confirmPasswordInput.value = 'AfroRhythm2023';
        agreeTermsCheck.checked = true;
        newsletterCheck.checked = true;
        
        // Trigger password strength update
        passwordInput.dispatchEvent(new Event('input'));
    }
    
    // Add keyboard shortcut for demo data (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            fillDemoData();
            showSuccess('Demo data filled! You can now click "Create Account"');
        }
    });
    
    // Demo hint
    console.log('Demo shortcut: Press Ctrl+Shift+D to auto-fill demo data');
});