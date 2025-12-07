// history.js - Leave History Module

/**
 * Initialize history functionality
 */
function initHistory() {
    // REPLACED: Employee select with Search Input Listener
    const searchInput = document.getElementById('historyEmployeeSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleHistorySearch);
    }
}

/**
 * Load deleted leaves and history (Unchanged)
 */
async function loadDeletedLeaves() {
    try {
        const result = await LeaveAPI.getHistory();

        if (!result.success) {
            throw new Error('Failed to load history');
        }

        renderDeletedLeavesTable(result.data);

    } catch (error) {
        console.error('Error loading deleted leaves:', error);
        showError('historyError', 'Failed to load leave history');
    }
}

/**
 * Render deleted leaves and history table (Unchanged)
 */
function renderDeletedLeavesTable(data) {
    const container = document.getElementById('deletedLeavesTable');

    if (data.deletedLeaves.length === 0 && data.allHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No History</h3>
                <p>Leave history will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h3 style="margin-bottom: 20px; color: var(--danger);">Deleted Leave Requests</h3>
        ${data.deletedLeaves.length > 0 ? renderDeletedLeavesSection(data.deletedLeaves) : '<p style="color: var(--secondary); margin-bottom: 40px;">No deleted leaves</p>'}
        
        <h3 style="margin-bottom: 20px;">All Leave History (Ascending Order)</h3>
        ${renderHistoryTable(data.allHistory)}
    `;
}

/**
 * Render deleted leaves section (Unchanged)
 */
function renderDeletedLeavesSection(deletedLeaves) {
    return `
        <table style="margin-bottom: 40px;">
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Period</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Deleted At</th>
                </tr>
            </thead>
            <tbody>
                ${deletedLeaves.map(leave => `
                    <tr>
                        <td>${leave.employee.name}</td>
                        <td>${capitalize(leave.type_of_leave)}</td>
                        <td>${formatDate(leave.start_leave)} - ${formatDate(leave.end_leave)}</td>
                        <td>${leave.days_requested}</td>
                        <td><span class="badge badge-${leave.status}">${leave.status.toUpperCase()}</span></td>
                        <td>${formatDate(leave.deleted_at)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Render all history table (Unchanged)
 */
function renderHistoryTable(allHistory) {
    return `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Period</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody>
                ${allHistory.map(leave => `
                    <tr>
                        <td>${leave.employee.name}</td>
                        <td>${capitalize(leave.type_of_leave)}</td>
                        <td>${formatDate(leave.start_leave)} - ${formatDate(leave.end_leave)}</td>
                        <td>${leave.days_requested}</td>
                        <td><span class="badge badge-${leave.status}">${leave.status.toUpperCase()}</span></td>
                        <td>${formatDate(leave.created_at)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Load employee data for search
 * REFACTORED: We only need to fetch the data, we don't build a <select> anymore.
 */
async function loadEmployeeHistorySection() {
    // Load employees if not already loaded
    if (!state.employees || state.employees.length === 0) {
        try {
            const result = await EmployeeAPI.getAll();
            if (result.success) {
                state.employees = result.data;
                console.log('Employees loaded for history search');
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }
}

/**
 * NEW: Handle History Search Input
 */
function handleHistorySearch(e) {
    const search = e.target.value.toLowerCase().trim();
    const results = document.getElementById('historySearchResults');
    const resultsContainer = document.getElementById('historyResults'); // The table container
    
    // Clear the table container when user starts typing new search
    if (search.length > 0) {
        resultsContainer.innerHTML = '';
        document.getElementById('historySelectedEmployeeContainer').style.display = 'none';
    }

    if (search.length < 2) {
        results.innerHTML = '';
        return;
    }

    // SAFETY CHECK
    if (!state.employees || !Array.isArray(state.employees)) {
        results.innerHTML = '<p style="color: var(--danger); padding: 10px;">Error: Employee data not loaded</p>';
        return;
    }

    const filtered = state.employees.filter(emp => {
        if (!emp) return false;
        const empId = emp.employee_id ? emp.employee_id.toLowerCase() : '';
        const empName = emp.name ? emp.name.toLowerCase() : '';
        return empId.includes(search) || empName.includes(search);
    });

    if (filtered.length === 0) {
        results.innerHTML = '<p style="color: var(--secondary); padding: 10px;">No employees found</p>';
    } else {
        // We use selectHistoryEmployee() here
        results.innerHTML = filtered.map(emp => createHistoryEmployeeCard(emp)).join('');
    }
}

/**
 * NEW: Create Card HTML
 */
function createHistoryEmployeeCard(emp) {
    return `
        <div class="employee-card" onclick="selectHistoryEmployee(${emp.id})">
            <h4 style="margin:0;">${emp.name}</h4>
            <small style="color: #666;">ID: ${emp.employee_id} | Balance: ${emp.leave_balance || 0} days</small>
        </div>
    `;
}

/**
 * NEW: Handle Selection of Employee
 * Exposed to window so the onclick in HTML works
 */
window.selectHistoryEmployee = async function(id) {
    const searchInput = document.getElementById('historyEmployeeSearch');
    const results = document.getElementById('historySearchResults');
    const selectedContainer = document.getElementById('historySelectedEmployeeContainer');

    // 1. Find the employee object
    const employee = state.employees.find(e => e.id === id);
    if (!employee) return;

    // 2. Update Search Input visually
    searchInput.value = employee.name;
    results.innerHTML = ''; // Clear dropdown

    // 3. Show selected feedback (Optional but good UX)
    selectedContainer.innerHTML = `
        <div style="padding: 10px; background: #e3f2fd; border-radius: 5px; color: #0d47a1;">
            Selected: <strong>${employee.name}</strong> (${employee.employee_id})
        </div>
    `;
    selectedContainer.style.display = 'block';

    // 4. Load the actual data
    await loadEmployeeHistoryById(id);
}

/**
 * REFACTORED: Fetch and Render Logic
 * Separated from the event handler so it's cleaner
 */
async function loadEmployeeHistoryById(employeeId) {
    const container = document.getElementById('historyResults');
    
    // Show loading state
    container.innerHTML = '<p style="text-align:center; padding: 20px;">Loading history...</p>';

    try {
        const result = await LeaveAPI.getEmployeeHistory(employeeId);

        if (!result.success) {
            throw new Error('Failed to load employee history');
        }

        renderEmployeeHistory(result.data);

    } catch (error) {
        console.error('Error loading employee history:', error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error Loading History</h3>
                <p>Please try again</p>
            </div>
        `;
    }
}

/**
 * Render employee history (Unchanged)
 */
function renderEmployeeHistory(data) {
    const container = document.getElementById('historyResults');

    if (data.leaves.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Leave History</h3>
                <p>This employee has no leave requests</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="background: var(--light); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>${data.employee.name}</h3>
            <p>Employee ID: ${data.employee.employee_id}</p>
            <p>Current Leave Credits: ${data.employee.leave_balance} days</p>
            <p>Status: <span class="badge badge-${data.employee.status}">${data.employee.status.toUpperCase()}</span></p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days Requested</th>
                    <th>Status</th>
                    <th>Requested On</th>
                </tr>
            </thead>
            <tbody>
                ${data.leaves.map(leave => `
                    <tr>
                        <td>${capitalize(leave.type_of_leave)}</td>
                        <td>${formatDate(leave.start_leave)}</td>
                        <td>${formatDate(leave.end_leave)}</td>
                        <td>${leave.days_requested}</td>
                        <td><span class="badge badge-${leave.status}">${leave.status.toUpperCase()}</span></td>
                        <td>${formatDate(leave.created_at)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initHistory,
        loadDeletedLeaves,
        loadEmployeeHistorySection
    };
}