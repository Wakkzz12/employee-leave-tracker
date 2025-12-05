// dashboard.js - Dashboard Module

/**
 * Load dashboard statistics and recent requests
 */
async function loadDashboard() {
    try {
        console.log('Loading dashboard data...');
        
        const result = await DashboardAPI.getStats();
        console.log('Dashboard API result:', result);

        // DEBUG: Show the full data structure
        if (result.success && result.data) {
            console.log('Full dashboard data structure:', JSON.stringify(result.data, null, 2));
            
            // Check all possible keys
            console.log('Available keys:', Object.keys(result.data));
            
            // Check if it's nested
            if (result.data.data) {
                console.log('Nested data found:', result.data.data);
            }
        }

        if (!result.success) {
            if (result.status === 401) {
                console.error('401 Unauthorized - Session may have expired');
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
    console.log('Dashboard stats data received:', data);
    
    // Direct mapping - your API returns these exact keys
    document.getElementById('totalEmployees').textContent = data.totalEmployees || 0;
    document.getElementById('totalPending').textContent = data.totalPending || 0;
    document.getElementById('totalApproved').textContent = data.totalApproved || 0;
    
    // Use totalDeleted if available, otherwise use totalRejected
    document.getElementById('totalDeleted').textContent = 
        data.totalDeleted || data.totalRejected || 0;
    
    console.log('Updated dashboard with:', {
        employees: data.totalEmployees || 0,
        pending: data.totalPending || 0,
        approved: data.totalApproved || 0,
        deleted: data.totalDeleted || data.totalRejected || 0
    });
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