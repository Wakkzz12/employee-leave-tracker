// auth.js - Authentication Module

/**
 * Initialize authentication event listeners
 */
function initAuth() {
    // Show register form
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    
    // Show login form
    document.getElementById('showLogin').addEventListener('click', showLoginForm);
    
    // Handle registration
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Handle login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

/**
 * Show register form
 */
function showRegisterForm() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('registerScreen').classList.remove('hidden');
}

/**
 * Show login form
 */
function showLoginForm() {
    document.getElementById('registerScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

/**
 * Handle user registration
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    // Client-side validation
    if (!isValidEmailDomain(email)) {
        showError('registerError', `Email must be from ${CONFIG.ALLOWED_EMAIL_DOMAIN} domain`);
        return;
    }

    if (password !== passwordConfirm) {
        showError('registerError', 'Passwords do not match');
        return;
    }

    if (password.length < 8) {
        showError('registerError', 'Password must be at least 8 characters');
        return;
    }

    // API call
    const result = await AuthAPI.register(name, email, password, passwordConfirm);

    if (result.success) {
        showSuccess('registerSuccess', 'Registration successful! Please login.');
        document.getElementById('registerForm').reset();
        setTimeout(() => {
            showLoginForm();
        }, 2000);
    } else {
        const message = result.error?.message || 'Registration failed';
        showError('registerError', message);
    }
}

/**
 * Handle user login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('loginError', 'Please enter email and password');
        return;
    }

    try {
        console.log('Starting login process...');
        
        // IMPORTANT: Get CSRF token first
        await getCsrfToken();
        
        // Wait a bit for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 200));

        // Now login
        const result = await AuthAPI.login(email, password);

        console.log('Login result:', result);

        if (result.success) {
            // Save user to state
            state.user = result.data.user;
            
            console.log('User authenticated:', state.user);
            
            // Update UI
            document.getElementById('userName').textContent = result.data.user.name;
            document.getElementById('userAvatar').textContent = getInitials(result.data.user.name);
            
            // Show dashboard
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboardContainer').classList.add('active');
            
            // Verify authentication before loading dashboard
            const authCheck = await AuthAPI.checkAuth();
            console.log('Auth check after login:', authCheck);
            
            if (authCheck.success && authCheck.data.authenticated) {
                // Load dashboard data
                loadDashboard();
            } else {
                console.error('Authentication verification failed');
                showError('loginError', 'Authentication failed. Please try again.');
                // Reload page to reset state
                setTimeout(() => location.reload(), 2000);
            }
        } else {
            const message = result.error?.message || 'Login failed. Please check your credentials.';
            showError('loginError', message);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('loginError', 'An error occurred. Please try again.');
    }
}

/**
 * Handle user logout
 */
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }

    await AuthAPI.logout();
    
    // Clear state
    state.user = null;
    state.employees = [];
    state.leaves = [];
    
    // Reload page
    location.reload();
}

/**
 * Check authentication on page load
 */
function checkAuth() {
    // If user is already authenticated (session exists), load dashboard
    if (state.user) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardContainer').classList.add('active');
        loadDashboard();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAuth,
        handleRegister,
        handleLogin,
        handleLogout,
        checkAuth
    };
}