// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
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
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordEyeIcon = document.getElementById('passwordEyeIcon');

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle eye icon
        if (type === 'text') {
            passwordEyeIcon.classList.remove('fa-eye');
            passwordEyeIcon.classList.add('fa-eye-slash');
            togglePasswordBtn.setAttribute('aria-label', 'Hide password');
        } else {
            passwordEyeIcon.classList.remove('fa-eye-slash');
            passwordEyeIcon.classList.add('fa-eye');
            togglePasswordBtn.setAttribute('aria-label', 'Show password');
        }
    });

    // Show error message
    function showError(message) {
        console.error("❌ Auth Error:", message);
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';

        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide after 8 seconds (increased for better readability)
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 8000);
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
    loginForm.addEventListener('submit', function (e) {
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

        // Create a controller for request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        // Call backend login API with cache-buster
        const timestamp = new Date().getTime();
        console.log(`🚀 Sending login request for ${email}...`);

        fetch(`../backend/api/login.php?t=${timestamp}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            signal: controller.signal,
            body: JSON.stringify({ email, password })
        })
            .then(res => {
                clearTimeout(timeoutId);
                console.log(`📡 Server responded with status: ${res.status}`);
                return res.text().then(text => {
                    if (!text) {
                        console.error("Empty response from server");
                        throw new Error('Server returned an empty response. Please check if PHP is working.');
                    }
                    try {
                        return { ok: res.ok, status: res.status, body: JSON.parse(text) };
                    } catch (e) {
                        console.error("🔥 Server returned non-JSON response:", text);
                        throw new Error('Server returned invalid data format. Please check backend logs.');
                    }
                });
            })
            .then(({ ok, body }) => {
                if (!ok || !body.success) {
                    throw new Error(body.message || 'Invalid email or password');
                }

                const user = body.data.user;

                showSuccess('Login successful! Redirecting to dashboard...');

                // Store minimal user data in localStorage for frontend routing
                localStorage.setItem('afroUser', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    role: user.type,
                    status: user.status,
                    joined: user.joined,
                    avatar: user.avatar,
                    isLoggedIn: true,
                    loginTime: new Date().toISOString()
                }));

                setTimeout(() => {
                    const path = window.location.pathname;
                    const directory = path.substring(0, path.lastIndexOf('/'));
                    const projectRoot = directory.substring(0, directory.lastIndexOf('/'));

                    console.log("🎯 Login successful. User type:", user.type);
                    console.log("📍 Current Auth Path:", path);
                    console.log("📂 Calculated Project Root:", projectRoot);

                    let targetUrl;
                    if (user.type === 'artist') {
                        targetUrl = projectRoot + '/artist.html';
                    } else if (user.type === 'admin' || user.type === 'moderator') {
                        targetUrl = projectRoot + '/admin.html';
                    } else {
                        targetUrl = projectRoot + '/fan.html';
                    }

                    console.log("↪️ Redirecting to:", targetUrl);
                    window.location.href = targetUrl;
                }, 1000);
            })
            .catch(err => {
                clearTimeout(timeoutId);

                if (err.name === 'AbortError') {
                    showError('Server is taking too long to respond. Please ensure MySQL is running or try again later.');
                } else {
                    console.error("❌ Login failed:", err);
                    showError(err.message || 'Login failed. Please try again.');
                }

                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;

                // Shake animation for error
                loginForm.classList.add('shake');
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 500);
            });
    });

    // Forgot password link
    forgotPasswordLink.addEventListener('click', function (e) {
        e.preventDefault();
        forgotPasswordModal.show();
    });

    // Send reset link
    sendResetLinkBtn.addEventListener('click', function () {
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
    googleLoginBtn.addEventListener('click', function () {
        googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
        googleLoginBtn.disabled = true;

        setTimeout(() => {
            showSuccess('Social login is disabled for demo. Use the Quick Demo Login tiles below.');
            googleLoginBtn.innerHTML = '<i class="fab fa-google"></i><span>Google</span>';
            googleLoginBtn.disabled = false;
        }, 1000);
    });

    // Facebook login
    facebookLoginBtn.addEventListener('click', function () {
        facebookLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
        facebookLoginBtn.disabled = true;

        setTimeout(() => {
            showSuccess('Social login is disabled for demo. Use the Quick Demo Login tiles below.');
            facebookLoginBtn.innerHTML = '<i class="fab fa-facebook-f"></i><span>Facebook</span>';
            facebookLoginBtn.disabled = false;
        }, 1000);
    });

    // Demo Credentials Quick-Fill
    const demoPills = document.querySelectorAll('.demo-pill');
    demoPills.forEach(pill => {
        pill.addEventListener('click', function () {
            const email = this.getAttribute('data-email');
            const pass = this.getAttribute('data-pass');

            emailInput.value = email;
            passwordInput.value = pass;

            // Highlight the inputs briefly
            emailInput.classList.add('is-valid');
            passwordInput.classList.add('is-valid');

            // Scroll to the submit button to make it obvious
            loginBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Pulse the login button
            loginBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                loginBtn.style.transform = 'scale(1)';
            }, 300);

            setTimeout(() => {
                emailInput.classList.remove('is-valid');
                passwordInput.classList.remove('is-valid');
            }, 1000);

            showSuccess(`Filled credentials for ${this.querySelector('span').textContent}. Click Login to continue.`);
        });
    });

    // Handle initial role from URL
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role) {
        let pillToClick = null;
        if (role === 'fan') {
            pillToClick = document.querySelector('.demo-pill[data-email*="john.mbarga"]');
        } else if (role === 'artist') {
            pillToClick = document.querySelector('.demo-pill[data-email*="marie.ndongo"]');
        } else if (role === 'admin') {
            pillToClick = document.querySelector('.demo-pill[data-email*="thomas.n"]');
        }

        if (pillToClick) {
            setTimeout(() => {
                pillToClick.click();
                showSuccess(`Context detected: ${role.charAt(0).toUpperCase() + role.slice(1)} Login. Credentials pre-filled.`);
            }, 500);
        }
    }

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
    console.log('Fan: john.mbarga@email.com, Password: password123');
    console.log('Artist: marie.ndongo@email.com, Password: password123');
    console.log('Admin: thomas.n@email.com, Password: password123');
});
