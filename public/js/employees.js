// Store original employee data for change detection
window.originalEmployeeData = {};

/**
 * Initialize employee management
 */
function initEmployees() {
    console.log('Initializing employees module...');
    
    // Add employee button
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', showAddEmployeeModal);
        console.log('✓ Add employee button initialized');
    }
    
    // Employee form submit
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', handleEmployeeSubmit);
        console.log('✓ Employee form initialized');
        
        // Reset form when modal closes
        employeeForm.addEventListener('reset', function() {
            const deleteBtn = document.getElementById('deleteEmployeeInModal');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            window.originalEmployeeData = {};
        });
    }
    
    console.log('Employees module initialization complete');
}

/**
 * Load all active employees
 */
async function loadEmployees() {
    try {
        const result = await EmployeeAPI.getAll();

        if (!result.success) {
            throw new Error('Failed to load employees');
        }

        // Extract employees array
        let employees = [];
        if (result.data && result.data.data && Array.isArray(result.data.data)) {
            employees = result.data.data;
        } else if (Array.isArray(result.data)) {
            employees = result.data;
        }
        
        state.employees = employees || [];
        renderEmployeesTable();

    } catch (error) {
        console.error('Error loading employees:', error);
        showError('employeesError', 'Failed to load employees');
    }
}

/**
 * Render active employees table
 */
function renderEmployeesTable() {
    const container = document.getElementById('employeesTable');

    if (!state.employees || state.employees.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Employees Yet</h3>
                <p>Click "Add Employee" to get started</p>
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
                    <th>Department</th>
                    <th>Position</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th>Leave Balance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${state.employees.map(emp => createEmployeeRow(emp)).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Create employee row
 */
function createEmployeeRow(emp) {
    return `
        <tr>
            <td>${emp.employee_id || '(not set)'}</td>
            <td>${emp.name || 'No Name'}</td>
            <td>${emp.department || '-'}</td>
            <td>${emp.position || '-'}</td>
            <td>${formatDate(emp.started_date)}</td>
            <td><span class="badge badge-${emp.status}">${emp.status.toUpperCase()}</span></td>
            <td>${emp.leave_balance || 0} days</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editEmployee(${emp.id})">Edit</button>
            </td>
        </tr>
    `;
}

/**
 * Show add employee modal
 */
function showAddEmployeeModal() {
    document.getElementById('employeeModalTitle').textContent = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    
    // Clear original data
    window.originalEmployeeData = {};
    
    document.getElementById('employeeModal').classList.add('active');
}

/**
 * Edit employee
 */
window.editEmployee = function (id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) {
        alert("Employee not found!");
        return;
    }

    // Store original data for change detection
    window.originalEmployeeData[id] = { ...emp };

    // Update modal title
    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = emp.id;

    // Fill form fields
    document.getElementById('empId').value = emp.employee_id || '';
    document.getElementById('empName').value = emp.name || '';
    document.getElementById('empDepartment').value = emp.department || '';
    document.getElementById('empPosition').value = emp.position || '';
    document.getElementById('empStartDate').value = formatDateForInput(emp.started_date);
    document.getElementById('empEndDate').value = formatDateForInput(emp.end_date);
    document.getElementById('empLeaveBalance').value = emp.leave_balance || 15;
    document.getElementById('empStatus').value = emp.status || 'regular';

    // Show delete button
    const deleteBtn = document.getElementById('deleteEmployeeInModal');
    if (deleteBtn) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.onclick = function() {
            if (confirm(`Are you sure you want to delete ${emp.name}?`)) {
                deleteEmployee(id);
                closeEmployeeModal();
            }
        };
    }

    document.getElementById('employeeModal').classList.add('active');
};

/**
 * Handle employee form submission with change detection
 */
async function handleEmployeeSubmit(e) {
    e.preventDefault();

    const employeeId = document.getElementById('employeeId').value;
    const isEditing = !!employeeId;
    const originalData = window.originalEmployeeData[employeeId];

    // Field configuration for employee form
    const employeeFieldMappings = [
        { fieldId: 'empId', dataField: 'employee_id', isDate: false },
        { fieldId: 'empName', dataField: 'name', isDate: false },
        { fieldId: 'empDepartment', dataField: 'department', isDate: false },
        { fieldId: 'empPosition', dataField: 'position', isDate: false },
        { fieldId: 'empStartDate', dataField: 'started_date', isDate: true },
        { fieldId: 'empEndDate', dataField: 'end_date', isDate: true },
        { fieldId: 'empLeaveBalance', dataField: 'leave_balance', isDate: false, isNumber: true }, // ADDED isNumber
        { fieldId: 'empStatus', dataField: 'status', isDate: false }
    ];

    let employeeData;
    
    if (isEditing) {
        // For editing: only send changed fields
        if (!originalData) {
            alert('Error: Original data not found. Please refresh and try again.');
            return;
        }
        
        employeeData = extractFormChanges(originalData, employeeFieldMappings);
        
        // Check if any changes were made
        if (Object.keys(employeeData).length === 0) {
            showNotification('No changes made to employee', 'info');
            closeEmployeeModal();
            return;
        }
    } else {
        // For creating: send all required fields
        employeeData = {};
        employeeFieldMappings.forEach(mapping => {
            const input = document.getElementById(mapping.fieldId);
            if (input && input.value.trim() !== '') {
                if (mapping.isNumber) {
                    // Convert to integer for number fields
                    employeeData[mapping.dataField] = parseInt(input.value) || 0;
                } else {
                    employeeData[mapping.dataField] = input.value.trim();
                }
            }
        });
        
        // Validate required fields for creation
        if (!employeeData.name || !employeeData.employee_id) {
            alert('Please fill in at least Employee ID and Name');
            return;
        }
    }

    console.log('Employee data to send:', employeeData);

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = isEditing ? 'Updating...' : 'Creating...';

    try {
        const result = isEditing 
            ? await EmployeeAPI.update(employeeId, employeeData)
            : await EmployeeAPI.create(employeeData);

        console.log('Employee save result:', result);

        if (result.success) {
            showNotification(
                isEditing ? 'Employee updated successfully!' : 'Employee created successfully!',
                'success'
            );
            closeEmployeeModal();
            loadEmployees();
        } else {
            // Handle validation errors - SHOW THE ACTUAL ERROR
            if (result.status === 422 && result.data) {
                console.error('Validation error details:', result.data);
                
                if (result.data.errors) {
                    const errorMessages = Object.values(result.data.errors).flat().join('\n');
                    showNotification('Validation errors:\n' + errorMessages, 'error');
                } else if (result.data.message) {
                    showNotification('Error: ' + result.data.message, 'error');
                } else {
                    showNotification('Validation failed', 'error');
                }
            } else if (result.error?.message) {
                showNotification(result.error.message, 'error');
            } else {
                showNotification('Failed to save employee', 'error');
            }
        }
    } catch (error) {
        console.error('Error saving employee:', error);
        showNotification('Error saving employee: ' + error.message, 'error');
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}
/**
 * Close employee modal
 */
window.closeEmployeeModal = function() {
    const modal = document.getElementById('employeeModal');
    if (modal) {
        modal.classList.remove('active');
        
        // Reset form
        const form = document.getElementById('employeeForm');
        if (form) {
            form.reset();
        }
        
        // Hide delete button
        const deleteBtn = document.getElementById('deleteEmployeeInModal');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
        
        // Clear original data
        window.originalEmployeeData = {};
    }
};

/**
 * Delete employee
 */
window.deleteEmployee = async function (id) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }

    try {
        const result = await EmployeeAPI.delete(id);

        if (result.success) {
            showNotification('Employee deleted successfully', 'success');
            loadEmployees();
        } else {
            showNotification('Failed to delete employee', 'error');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        showNotification('Error deleting employee', 'error');
    }
};

/**
 * Soft-delete employee
 */
window.deleteEmployee = async function (id) {
    if (!confirm('Delete this employee?')) return;

    const result = await EmployeeAPI.delete(id);

    if (result.success) {
        loadEmployees();
    } else {
        alert('Failed to delete employee');
    }
};

async function loadDeletedEmployees() {
    console.log('=== loadDeletedEmployees START ===');
    
    const container = document.getElementById('deletedEmployeesTable');
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading deleted employees...</p>
        </div>
    `;
    
    try {
        console.log('Calling EmployeeAPI.deleted()...');
        const result = await EmployeeAPI.deleted();
        
        console.log('Full API result:', result);
        
        // FIX HERE: Access the nested data structure
        let employees = [];
        
        if (result.success && result.data) {
            // CASE 1: If result.data is already an array (direct)
            if (Array.isArray(result.data)) {
                employees = result.data;
                console.log('Found employees directly in result.data');
            }
            // CASE 2: If result.data has a nested data array (your case)
            else if (result.data.data && Array.isArray(result.data.data)) {
                employees = result.data.data;
                console.log('Found employees in result.data.data');
            }
            // CASE 3: If result.data has success property with nested data
            else if (result.data.success && result.data.data && Array.isArray(result.data.data)) {
                employees = result.data.data;
                console.log('Found employees in result.data.data (with success wrapper)');
            }
        }
        
        console.log('Employees array:', employees);
        console.log('Number of employees:', employees.length);
        
        if (employees.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Deleted Employees Found</h3>
                    <p>Database has records but API returned empty array.</p>
                    <div class="debug-info">
                        <strong>Debug Data:</strong><br>
                        <pre>${JSON.stringify(result, null, 2)}</pre>
                    </div>
                </div>`;
            return;
        }

        // Render the table with the ACTUAL data
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Status</th>
                        <th>Deleted At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => {
                        console.log('Employee object:', emp); // Debug each employee
                        return `
                        <tr>
                            <td>${emp.employee_id || emp.id || '-'}</td>
                            <td>${emp.name || 'Unknown'}</td>
                            <td>${emp.department || '-'}</td>
                            <td>${emp.position || '-'}</td>
                            <td><span class="badge badge-${emp.status || 'deleted'}">${(emp.status || 'deleted').toUpperCase()}</span></td>
                            <td>${emp.deleted_at ? formatDateTime(emp.deleted_at) : 'Unknown'}</td>
                            <td class="text-center" style="white-space: nowrap;">
                                <button class="btn btn-success btn-sm me-1" onclick="restoreEmployee({{ $emp->id }})">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="forceDeleteEmployee({{ $emp->id }})">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </td>

                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        console.log('=== loadDeletedEmployees END ===');

    } catch (error) {
        console.error('Error in loadDeletedEmployees:', error);
        
        container.innerHTML = `
            <div class="error-state">
                <h3>Error Loading Deleted Employees</h3>
                <p><strong>Error:</strong> ${error.message}</p>
                <button onclick="loadDeletedEmployees()" class="btn btn-primary">Retry</button>
            </div>`;
    }
}

/**
 * Restore employee
 */
window.restoreEmployee = async function (id) {
    const result = await EmployeeAPI.restore(id);
    if (result.success) {
        loadDeletedEmployees();
        loadEmployees();
        alert('Employee restored successfully');
    } else {
        alert('Failed to restore employee');
    }
};

/**
 * Permanent delete
 */
window.forceDeleteEmployee = async function (id) {
    if (!confirm("Permanently delete this employee?")) return;

    const result = await EmployeeAPI.forceDelete(id);
    if (result.success) {
        loadDeletedEmployees();
        alert("Employee permanently deleted.");
    } else {
        alert("Failed to permanently delete employee.");
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initEmployees,
        loadEmployees,
        loadDeletedEmployees
    };
}
