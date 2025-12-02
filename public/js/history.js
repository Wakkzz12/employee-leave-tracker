// history.js - Leave History Module

/**
 * Initialize history functionality
 */
function initHistory() {
    // Employee history select
    document.getElementById('historyEmployeeSelect').addEventListener('change', handleEmployeeHistorySelect);
}

/**
 * Load deleted leaves and history
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
 * Render deleted leaves and history table
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
 * Render deleted leaves section
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
 * Render all history table
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
 * Load employee history section
 */
async function loadEmployeeHistorySection() {
    // Load employees if not already loaded
    if (state.employees.length === 0) {
        try {
            const result = await EmployeeAPI.getAll();
            if (result.success) {
                state.employees = result.data;
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            return;
        }
    }

    // Populate employee select dropdown
    const select = document.getElementById('historyEmployeeSelect');
    select.innerHTML = '<option value="">Choose an employee</option>' + 
        state.employees.map(emp => 
            `<option value="${emp.id}">${emp.name} (${emp.employee_id})</option>`
        ).join('');
}

/**
 * Handle employee history select change
 */
async function handleEmployeeHistorySelect(e) {
    const employeeId = e.target.value;
    const container = document.getElementById('historyResults');
    
    if (!employeeId) {
        container.innerHTML = '';
        return;
    }

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
 * Render employee history
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
            <p>Current Leave Credits: ${data.employee.leave_credits} days</p>
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