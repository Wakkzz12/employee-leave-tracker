// dashboard.js - Dashboard Module

/**
 * Load dashboard statistics and recent requests
 */
async function loadDashboard() {
    try {
        console.log('Loading dashboard data...');
        
        const result = await DashboardAPI.getStats();
        console.log('Dashboard API result:', result);

        if (!result.success) {
            if (result.status === 401) {
                console.error('401 Unauthorized - Session may have expired');
                // Show error but don't redirect immediately
                // Try to reload the page to establish session again
                alert('Session error. Please wait...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                location.reload();
                return;
            }
            throw new Error('Failed to load dashboard');
        }

        const data = result.data;

        // Update statistics
        updateDashboardStats(data);

        // Update recent requests
        updateRecentRequests(data.recentRequests);

        console.log('Dashboard loaded successfully');

    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Show empty state instead of redirecting
        document.getElementById('recentRequests').innerHTML = `
            <div class="empty-state">
                <h3>Error Loading Data</h3>
                <p>Please refresh the page</p>
            </div>
        `;
    }
}

/**
 * Update dashboard statistics cards
 */
function updateDashboardStats(data) {
    document.getElementById('totalEmployees').textContent = data.totalEmployees || 0;
    document.getElementById('totalPending').textContent = data.totalPending || 0;
    document.getElementById('totalApproved').textContent = data.totalApproved || 0;
    document.getElementById('totalDeleted').textContent = data.totalDeleted || 0;
}

/**
 * Update recent leave requests section
 */
function updateRecentRequests(requests) {
    const recentContainer = document.getElementById('recentRequests');
    
    if (!requests || requests.length === 0) {
        recentContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Recent Requests</h3>
                <p>Leave requests will appear here</p>
            </div>
        `;
        return;
    }

    recentContainer.innerHTML = requests.map(req => createRequestItem(req)).join('');
}

/**
 * Create HTML for a single request item
 */
function createRequestItem(req) {
    return `
        <div class="request-item">
            <h4>${req.employee.name}</h4>
            <p><strong>Type:</strong> ${capitalize(req.type_of_leave)}</p>
            <p><strong>Period:</strong> ${formatDate(req.start_leave)} - ${formatDate(req.end_leave)}</p>
            <p><strong>Days:</strong> ${req.days_requested} | <strong>Remaining Credits:</strong> ${req.remaining_credits}</p>
            <span class="badge badge-${req.status}">${req.status.toUpperCase()}</span>
        </div>
    `;
}

/**
 * Redirect to login screen
 */
function redirectToLogin(message) {
    document.getElementById('dashboardContainer').classList.remove('active');
    document.getElementById('loginScreen').classList.remove('hidden');
    
    if (message) {
        showError('loginError', message);
    }
    
    // Clear user state
    state.user = null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadDashboard,
        updateDashboardStats,
        updateRecentRequests
    };
}