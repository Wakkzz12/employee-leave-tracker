// leaves.js - Leave Management Module

/**
 * Initialize leave management
 */
function initLeaves() {
    console.log('Initializing leaves module...');
    
    // Close leave modal - WITH NULL CHECK
    const closeLeaveModalBtn = document.getElementById('closeLeaveModal');
    if (closeLeaveModalBtn) {
        closeLeaveModalBtn.addEventListener('click', closeLeaveModal);
        console.log('✓ Close leave modal button initialized');
    } else {
        console.log('⚠ closeLeaveModal button not found');
        // Try to add ID dynamically if button exists without ID
        const cancelBtn = document.querySelector('#leaveModal .modal-footer .btn-secondary');
        if (cancelBtn && !cancelBtn.id) {
            cancelBtn.id = 'closeLeaveModal';
            cancelBtn.addEventListener('click', closeLeaveModal);
            console.log('✓ Added ID and listener to cancel button');
        }
    }
    
    // Leave status change handler - WITH NULL CHECK
    const editLeaveStatus = document.getElementById('editLeaveStatus');
    if (editLeaveStatus) {
        editLeaveStatus.addEventListener('change', handleLeaveStatusChange);
        console.log('✓ Leave status change handler initialized');
    }
    
    // Leave form submit - WITH NULL CHECK
    const leaveForm = document.getElementById('leaveForm');
    if (leaveForm) {
        leaveForm.addEventListener('submit', handleLeaveSubmit);
        console.log('✓ Leave form initialized');
    }
    
    console.log('Leaves module initialization complete');
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


async function handleLeaveSubmit(e) {
    e.preventDefault();

    const leaveId = document.getElementById('leaveId').value;
    const currentLeave = state.leaves.find(l => l.id == leaveId);

    // Only include changed fields
    const leaveData = {};

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    console.log('CSRF Token for leave update:', !!csrfToken);

    // Helper to check if value changed
    const getChangedValue = (fieldId, propertyName) => {
        const input = document.getElementById(fieldId);
        const newValue = input.value;
        const oldValue = currentLeave ? currentLeave[propertyName] : null;
        
        if (newValue !== (oldValue?.toString() || '')) {
            return newValue;
        }
        return undefined;
    };

    const type = getChangedValue('editLeaveType', 'type_of_leave');
    if (type !== undefined) leaveData.type_of_leave = type;

    const start = getChangedValue('editStartLeave', 'start_leave');
    if (start !== undefined) leaveData.start_leave = start;

    const end = getChangedValue('editEndLeave', 'end_leave');
    if (end !== undefined) leaveData.end_leave = end;

    const status = getChangedValue('editLeaveStatus', 'status');
    if (status !== undefined) leaveData.status = status;

    const reason = document.getElementById('rejectionReason').value;
    if (status === 'rejected' && reason) {
        leaveData.rejection_reason = reason;
    }

    console.log('Updating leave with:', leaveData);

    try {
        const result = await LeaveAPI.update(leaveId, leaveData);

        console.log('Update result:', result);

        if (result.success) {
            alert('Leave request updated successfully!');
            closeLeaveModal();
            loadLeaves();
        } else {
            // Handle CSRF/session errors
            if (result.status === 401 || result.error?.message?.includes('Authentication') || result.error?.message?.includes('CSRF')) {
                alert('Your session has expired or there\'s a CSRF issue. Please refresh the page and login again.');
                localStorage.clear();
                window.location.reload();
            } else {
                showDetailedError(result.data || result.error);
            }
        }
    } catch (error) {
        console.error('Error updating leave:', error);
        alert('Error updating leave request: ' + error.message);
    }
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
window.editLeave = function (id) {
    const leave = state.leaves.find(l => l.id === id);
    if (!leave) return alert("Leave request not found!");

    document.getElementById('leaveId').value = leave.id;
    document.getElementById('leaveEmpName').value = leave.employee?.name || 'Unknown';
    document.getElementById('editLeaveType').value = leave.type_of_leave;
    document.getElementById('editStartLeave').value = leave.start_leave;
    document.getElementById('editEndLeave').value = leave.end_leave;
    document.getElementById('editLeaveStatus').value = leave.status.toLowerCase();

    // Show/hide rejection reason
    const reasonGroup = document.getElementById('rejectionReasonGroup');
    if (leave.status.toLowerCase() === 'rejected') {
        reasonGroup.classList.remove('hidden');
        document.getElementById('rejectionReason').value = leave.rejection_reason || '';
    } else {
        reasonGroup.classList.add('hidden');
    }

    // Remove required attributes for edit
    const form = document.getElementById('leaveForm');
    const inputs = form.querySelectorAll('[required]');
    inputs.forEach(input => input.removeAttribute('required'));

    // Show delete button in modal footer (with icon)
    let deleteBtn = document.getElementById('deleteLeaveInModal');
    const modalFooter = document.querySelector('#leaveModal .modal-footer');
    
    if (!deleteBtn) {
        deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.id = 'deleteLeaveInModal';
        deleteBtn.innerHTML = '🗑️'; // Icon + text
        deleteBtn.title = 'Delete this leave request';
        deleteBtn.style.marginRight = 'auto';
        modalFooter.insertBefore(deleteBtn, modalFooter.firstChild);
    }
    
    // Update delete handler for this specific leave
    deleteBtn.onclick = function() {
        if (confirm(`Delete leave request for ${leave.employee?.name || 'this employee'}?`)) {
            deleteLeave(id);
            closeLeaveModal();
        }
    };

    deleteBtn.style.display = 'inline-block';

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