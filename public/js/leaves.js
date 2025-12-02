// leaves.js - Leave Management Module

/**
 * Initialize leave management
 */
function initLeaves() {
    // Close leave modal
    document.getElementById('closeLeaveModal').addEventListener('click', closeLeaveModal);
    
    // Leave status change handler
    document.getElementById('editLeaveStatus').addEventListener('change', handleLeaveStatusChange);
    
    // Leave form submit
    document.getElementById('leaveForm').addEventListener('submit', handleLeaveUpdate);
}

/**
 * Load all leave requests
 */
async function loadLeaves() {
    try {
        const result = await LeaveAPI.getAll();

        if (!result.success) {
            throw new Error('Failed to load leave requests');
        }

        state.leaves = result.data;
        renderLeavesTable();
        console.log('Leaves loaded successfully');

    } catch (error) {
        console.error('Error loading leaves:', error);
        showError('leavesError', 'Failed to load leave requests');
    }
}

/**
 * Render leaves table
 */
function renderLeavesTable() {
    const container = document.getElementById('leavesTable');

    if (state.leaves.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Leave Requests</h3>
                <p>Leave requests will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Remaining Credits</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${state.leaves.map(leave => createLeaveRow(leave)).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Create HTML for leave table row
 */
function createLeaveRow(leave) {
    return `
        <tr>
            <td>${leave.employee.employee_id}</td>
            <td>${leave.employee.name}</td>
            <td>${capitalize(leave.type_of_leave)}</td>
            <td>${formatDate(leave.start_leave)}</td>
            <td>${formatDate(leave.end_leave)}</td>
            <td>${leave.days_requested}</td>
            <td>${leave.remaining_credits}</td>
            <td><span class="badge badge-${leave.status}">${leave.status.toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editLeave(${leave.id})">Edit</button>
                    ${leave.status === 'rejected' ? `<button class="btn btn-danger btn-sm" onclick="deleteLeave(${leave.id})">Delete</button>` : ''}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Close leave modal
 */
function closeLeaveModal() {
    document.getElementById('leaveModal').classList.remove('active');
}

/**
 * Handle leave status change
 */
function handleLeaveStatusChange(e) {
    const reasonGroup = document.getElementById('rejectionReasonGroup');
    if (e.target.value === 'rejected') {
        reasonGroup.classList.remove('hidden');
    } else {
        reasonGroup.classList.add('hidden');
    }
}

/**
 * Handle leave update submission
 */
async function handleLeaveUpdate(e) {
    e.preventDefault();

    const id = document.getElementById('leaveId').value;
    const leaveData = {
        start_leave: document.getElementById('editStartLeave').value,
        end_leave: document.getElementById('editEndLeave').value,
        type_of_leave: document.getElementById('editLeaveType').value,
        status: document.getElementById('editLeaveStatus').value,
        rejection_reason: document.getElementById('rejectionReason').value || null
    };

    // Validate rejection reason if status is rejected
    if (leaveData.status === 'rejected' && !leaveData.rejection_reason) {
        alert('Please provide a rejection reason');
        return;
    }

    try {
        const result = await LeaveAPI.update(id, leaveData);

        if (result.success) {
            closeLeaveModal();
            loadLeaves();
            
            // Reload dashboard if on dashboard section
            if (state.currentSection === 'dashboard') {
                loadDashboard();
            }
            
            alert('Leave request updated successfully!');
        } else {
            showDetailedError(result.error);
        }
    } catch (error) {
        console.error('Error updating leave:', error);
        alert('Error updating leave request');
    }
}

/**
 * Edit leave request
 */
window.editLeave = function(id) {
    const leave = state.leaves.find(l => l.id === id);
    if (!leave) {
        alert('Leave request not found');
        return;
    }

    document.getElementById('leaveId').value = leave.id;
    document.getElementById('leaveEmpName').value = `${leave.employee.name} (${leave.employee.employee_id})`;
    document.getElementById('editLeaveType').value = leave.type_of_leave;
    document.getElementById('editStartLeave').value = leave.start_leave;
    document.getElementById('editEndLeave').value = leave.end_leave;
    document.getElementById('editLeaveStatus').value = leave.status;
    document.getElementById('rejectionReason').value = leave.rejection_reason || '';
    
    // Show/hide rejection reason
    const reasonGroup = document.getElementById('rejectionReasonGroup');
    if (leave.status === 'rejected') {
        reasonGroup.classList.remove('hidden');
    } else {
        reasonGroup.classList.add('hidden');
    }
    
    document.getElementById('leaveModal').classList.add('active');
};

/**
 * Delete leave request
 */
window.deleteLeave = async function(id) {
    if (!confirm('Are you sure you want to delete this leave request?')) {
        return;
    }

    try {
        const result = await LeaveAPI.delete(id);

        if (result.success) {
            loadLeaves();
            alert('Leave request deleted successfully');
        } else {
            alert('Failed to delete leave request');
        }
    } catch (error) {
        console.error('Error deleting leave:', error);
        alert('Error deleting leave request');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initLeaves,
        loadLeaves,
        renderLeavesTable
    };
}