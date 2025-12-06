// request-leave.js - Leave Request Module

/**
 * Initialize leave request functionality
 */
function initRequestLeave() {
    // Employee search
    document.getElementById('employeeSearch').addEventListener('input', handleEmployeeSearch);
    
    // File upload
    document.getElementById('fileUpload').addEventListener('click', () => {
        document.getElementById('proofFile').click();
    });
    
    document.getElementById('proofFile').addEventListener('change', handleFileSelect);
    
    // Leave request form
    document.getElementById('createLeaveForm').addEventListener('submit', handleLeaveRequestSubmit);
}

/**
 * Load request leave section
 */
async function loadRequestLeave() {
    console.log('Loading request leave section...');
    
    // Load employees if not already loaded
    if (!state.employees || state.employees.length === 0) {
        try {
            console.log('Fetching employees for leave request...');
            const result = await EmployeeAPI.getAll();
            
            console.log('EmployeeAPI.getAll() result:', result);
            
            if (result.success) {
                // Handle nested data structure
                let employees = [];
                
                if (result.data) {
                    // Case 1: result.data is already an array
                    if (Array.isArray(result.data)) {
                        employees = result.data;
                        console.log('Employees loaded directly from result.data');
                    }
                    // Case 2: result.data has nested data array
                    else if (result.data.data && Array.isArray(result.data.data)) {
                        employees = result.data.data;
                        console.log('Employees loaded from result.data.data');
                    }
                    // Case 3: result.data has success wrapper
                    else if (result.data.success && result.data.data && Array.isArray(result.data.data)) {
                        employees = result.data.data;
                        console.log('Employees loaded from result.data.data (success wrapper)');
                    }
                }
                
                console.log('Setting state.employees to:', employees);
                state.employees = employees;
            } else {
                console.error('Failed to load employees:', result.error);
                state.employees = []; // Set empty array as fallback
            }
        } catch (error) {
            console.error('Error loading employees for leave request:', error);
            state.employees = []; // Set empty array as fallback
        }
    } else {
        console.log('Employees already loaded:', state.employees.length, 'employees');
    }
}

/**
 * Handle employee search
 */
function handleEmployeeSearch(e) {
    const search = e.target.value.toLowerCase().trim();
    const results = document.getElementById('searchResults');
    
    if (search.length < 2) {
        results.innerHTML = '';
        return;
    }

    // SAFETY CHECK: Ensure state.employees is an array
    if (!state.employees || !Array.isArray(state.employees)) {
        console.error('state.employees is not an array:', state.employees);
        results.innerHTML = '<p style="color: var(--danger);">Error: Employee data not loaded properly</p>';
        state.employees = []; // Reset to empty array
        return;
    }

    console.log('Searching in', state.employees.length, 'employees for:', search);

    const filtered = state.employees.filter(emp => {
        if (!emp) return false;
        
        const empId = emp.employee_id ? emp.employee_id.toLowerCase() : '';
        const empName = emp.name ? emp.name.toLowerCase() : '';
        
        return empId.includes(search) || empName.includes(search);
    });

    console.log('Found', filtered.length, 'employees matching search');

    if (filtered.length === 0) {
        results.innerHTML = '<p style="color: var(--secondary);">No employees found</p>';
    } else {
        results.innerHTML = filtered.map(emp => createEmployeeCard(emp)).join('');
    }
}

/**
 * Create employee search result card
 */
function createEmployeeCard(emp) {
    return `
        <div class="employee-card" onclick="selectEmployee(${emp.id})">
            <h4>${emp.name}</h4>
            <p>ID: ${emp.employee_id} | Leave Balance: ${emp.leave_balance} days</p>
        </div>
    `;
}

/**
 * Select employee for leave request
 */
window.selectEmployee = function(id) {
    // SAFETY CHECK
    if (!state.employees || !Array.isArray(state.employees)) {
        console.error('Cannot select employee: state.employees is not an array');
        alert('Employee data not loaded properly. Please refresh the page.');
        return;
    }
    
    const employee = state.employees.find(e => e && e.id === id);
    if (!employee) {
        alert('Employee not found');
        return;
    }

    document.getElementById('selectedEmployeeId').value = employee.id;
    document.getElementById('selectedEmployeeCard').innerHTML = `
        <h4>${employee.name || 'Unknown'}</h4>
        <p>ID: ${employee.employee_id || 'N/A'} | Leave Balance: ${employee.leave_balance || 0} days | Status: ${employee.status || 'Unknown'}</p>
    `;
    
    // Clear search
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('employeeSearch').value = '';
    
    // Show leave request form
    document.getElementById('leaveRequestForm').classList.remove('hidden');
}

/**
 * Handle file selection
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
        alert(validation.errors.join('\n'));
        e.target.value = '';
        return;
    }

    document.getElementById('fileUpload').classList.add('has-file');
    document.getElementById('fileName').textContent = `Selected: ${file.name}`;
    document.getElementById('fileName').classList.remove('hidden');
}

async function handleLeaveRequestSubmit(e) {
    e.preventDefault();

    const employeeId = document.getElementById('selectedEmployeeId').value;
    const leaveType = document.getElementById('leaveType').value;
    const startLeave = document.getElementById('startLeave').value;
    const endLeave = document.getElementById('endLeave').value;

    console.log('Submitting leave request for employee:', employeeId);

    // Basic validation
    if (!employeeId) {
        alert('Please select an employee first');
        return;
    }
    
    if (!leaveType) {
        alert('Please select a leave type');
        return;
    }
    
    if (!startLeave || !endLeave) {
        alert('Please select both start and end dates');
        return;
    }

    // Validate dates
    const startDate = new Date(startLeave);
    const endDate = new Date(endLeave);
    if (endDate < startDate) {
        alert('End date must be after start date');
        return;
    }

    if(selectEmployee.leave_balance <= 0) {
        alert('Insufficient leave balance');
        return;
    }
    // Create FormData
    const formData = new FormData();
    formData.append('employee_id', employeeId);
    formData.append('type_of_leave', leaveType);
    formData.append('start_leave', startLeave);
    formData.append('end_leave', endLeave);
    formData.append('status', 'pending'); // Add status as required by your FormRequest
    
    // Add file if exists
    const file = document.getElementById('proofFile').files[0];
    if (file) {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }
        formData.append('proof_file', file);
    }
    
    // Log FormData for debugging
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
        const result = await LeaveAPI.create(formData);
        console.log('Leave API Result:', result);

        if (result.success) {
            alert('Leave request submitted successfully!');
            resetLeaveRequestForm();
        } else {
            console.error('Leave request failed:', result);
            
            // Handle different error scenarios
            if (result.data) {
                // The error is in result.data (from Laravel)
                showDetailedError(result.data);
            } else if (result.error) {
                // The error is in result.error (network or fetch error)
                showDetailedError(result.error);
            } else {
                alert('Failed to submit leave request');
            }
        }
        
    } catch (error) {
        console.error('Exception in handleLeaveRequestSubmit:', error);
        showDetailedError({ message: error.message || 'Unknown error' });
    }
}
/**
 * Reset leave request form
 */
function resetLeaveRequestForm() {
    document.getElementById('createLeaveForm').reset();
    document.getElementById('leaveRequestForm').classList.add('hidden');
    document.getElementById('fileUpload').classList.remove('has-file');
    document.getElementById('fileName').classList.add('hidden');
    document.getElementById('selectedEmployeeId').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('employeeSearch').value = '';
}
// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initRequestLeave,
        loadRequestLeave,
        handleEmployeeSearch
    };
}