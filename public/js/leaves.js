// leaves.js - Complete Updated Version

/**
 * Initialize leave management
 */
function initLeaves() {
    console.log('Initializing leaves module...');
    
    // Initialize modal close buttons
    const closeLeaveModalBtn = document.getElementById('closeLeaveModalBtn');
    if (closeLeaveModalBtn) {
        closeLeaveModalBtn.addEventListener('click', closeLeaveModal);
        console.log('✓ Close leave modal button initialized');
    }
    
    const cancelLeaveBtn = document.getElementById('cancelLeaveBtn');
    if (cancelLeaveBtn) {
        cancelLeaveBtn.addEventListener('click', closeLeaveModal);
        console.log('✓ Cancel leave button initialized');
    }
    
    // Leave status change handler
    const editLeaveStatus = document.getElementById('editLeaveStatus');
    if (editLeaveStatus) {
        editLeaveStatus.addEventListener('change', handleLeaveStatusChange);
        console.log('✓ Leave status change handler initialized');
    }
    
    // Leave form submit
    const leaveForm = document.getElementById('leaveForm');
    if (leaveForm) {
        leaveForm.addEventListener('submit', handleLeaveSubmit);
        console.log('✓ Leave form initialized');
        
        // Reset form when closed
        leaveForm.addEventListener('reset', function() {
            const deleteBtn = document.getElementById('deleteLeaveInModal');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
        });
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
                    <th>Remaining Balance</th>
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
            <td>${leave.remaining_credits} days</td>
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
 * Handle leave form submission
 */
async function handleLeaveSubmit(e) {
    e.preventDefault();

    const leaveId = document.getElementById('leaveId').value;
    const originalData = window.originalLeaveData[leaveId];

    if (!originalData) {
        alert('Error: Original data not found. Please refresh and try again.');
        return;
    }

    // Get the current leave from state
    const currentLeave = state.leaves.find(l => l.id == leaveId);
    
    // Get form values
    const startDateInput = document.getElementById('editStartLeave').value;
    const endDateInput = document.getElementById('editEndLeave').value;
    const typeInput = document.getElementById('editLeaveType').value;
    const statusInput = document.getElementById('editLeaveStatus').value;
    const reasonInput = document.getElementById('rejectionReason').value;

    // ALWAYS include ALL required fields with lowercase status
    const leaveData = {
        employee_id: currentLeave?.employee?.id || originalData.employee_id,
        start_leave: startDateInput || originalData.start_leave,
        end_leave: endDateInput || originalData.end_leave,
        type_of_leave: typeInput || originalData.type_of_leave,
        status: (statusInput || originalData.status).toLowerCase(),
        rejection_reason: reasonInput || originalData.rejection_reason || null
    };

    console.log('Sending leave data (with lowercase status):', leaveData);

    // Check if any changes were made
    let hasChanges = false;
    const changedFields = [];
    
    // Helper function for date comparison
    function compareDates(dateStr1, dateStr2) {
        if (!dateStr1 && !dateStr2) return true;
        if (!dateStr1 || !dateStr2) return false;
        return dateStr1 === dateStr2;
    }
    
    // Compare each field
    if (!compareDates(leaveData.start_leave, originalData.start_leave)) {
        hasChanges = true;
        changedFields.push('start date');
    }
    
    if (!compareDates(leaveData.end_leave, originalData.end_leave)) {
        hasChanges = true;
        changedFields.push('end date');
    }
    
    if (leaveData.type_of_leave !== originalData.type_of_leave) {
        hasChanges = true;
        changedFields.push('leave type');
    }
    
    // Compare status in lowercase
    const newStatusLower = leaveData.status.toLowerCase();
    const oldStatusLower = (originalData.status || '').toLowerCase();
    if (newStatusLower !== oldStatusLower) {
        hasChanges = true;
        changedFields.push('status');
    }
    
    const originalReason = originalData.rejection_reason || '';
    const newReason = leaveData.rejection_reason || '';
    if (newReason !== originalReason) {
        hasChanges = true;
        changedFields.push('rejection reason');
    }

    if (!hasChanges) {
        showNotification('No changes made to leave request', 'info');
        closeLeaveModal();
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
        const result = await LeaveAPI.update(leaveId, leaveData);

        if (result.success) {
            const changeMessage = changedFields.length > 0 
                ? `Updated: ${changedFields.join(', ')}`
                : 'Updated successfully';
            showNotification(`Leave request ${changeMessage}!`, 'success');
            closeLeaveModal();
            loadLeaves();
        } else {
            if (result.status === 422) {
                const errors = result.data?.errors || {};
                const errorMessages = Object.values(errors).flat().join('\n');
                showNotification(`Validation errors:\n${errorMessages}`, 'danger');
            } else if (result.status === 500) {
                const errorMsg = result.data?.message || 'Server error occurred';
                showNotification(`Server error: ${errorMsg}`, 'danger');
            } else {
                showNotification('Failed to update leave request', 'danger');
            }
        }
    } catch (error) {
        console.error('Error updating leave:', error);
        showNotification('Error updating leave request: ' + error.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

/**
 * Edit leave request
 */
window.editLeave = function (id) {
    const leave = state.leaves.find(l => l.id === id);
    if (!leave) return alert("Leave request not found!");

    // Store original data
    window.originalLeaveData[id] = { 
        ...leave,
        start_leave: leave.start_leave,
        end_leave: leave.end_leave
    };

    // Populate form - ensure status is lowercase for the select
    document.getElementById('leaveId').value = leave.id;
    document.getElementById('leaveEmpName').value = leave.employee?.name || 'Unknown';
    document.getElementById('editLeaveType').value = leave.type_of_leave;
    document.getElementById('editStartLeave').value = formatDateForInput(leave.start_leave);
    document.getElementById('editEndLeave').value = formatDateForInput(leave.end_leave);
    document.getElementById('editLeaveStatus').value = leave.status.toLowerCase(); // Lowercase!

    // Show/hide rejection reason (use lowercase for comparison)
    const reasonGroup = document.getElementById('rejectionReasonGroup');
    if (leave.status.toLowerCase() === 'rejected') {
        reasonGroup.classList.remove('hidden');
        document.getElementById('rejectionReason').value = leave.rejection_reason || '';
    } else {
        reasonGroup.classList.add('hidden');
    }

    // Show delete button
    let deleteBtn = document.getElementById('deleteLeaveInModal');
    if (deleteBtn) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.onclick = function() {
            if (confirm(`Delete leave request for ${leave.employee?.name || 'this employee'}?`)) {
                deleteLeave(id);
                closeLeaveModal();
            }
        };
    }

    document.getElementById('leaveModal').classList.add('active');
};



/**
 * Handle leave status change
 */
function handleLeaveStatusChange(e) {
    const reasonGroup = document.getElementById('rejectionReasonGroup');
    if (e.target.value === 'rejected') {
        reasonGroup.classList.remove('hidden');
        document.getElementById('rejectionReason').required = true;
    } else {
        reasonGroup.classList.add('hidden');
        document.getElementById('rejectionReason').required = false;
    }
}

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
            showNotification('Leave request deleted successfully', 'success');
            loadLeaves();
        } else {
            showNotification('Failed to delete leave request', 'danger');
        }
    } catch (error) {
        console.error('Error deleting leave:', error);
        showNotification('Error deleting leave request', 'danger');
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