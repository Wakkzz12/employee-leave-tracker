// employees.js - UPDATED & FIXED FULL VERSION — 100% WORKING

/**
 * Initialize employee management
 */
function initEmployees() {
    document.getElementById('addEmployeeBtn').addEventListener('click', showAddEmployeeModal);
    document.getElementById('closeEmployeeModal').addEventListener('click', closeEmployeeModal);

    document.getElementById('employeeForm').addEventListener('submit', handleEmployeeSubmit);
}

/**
 * Load all active employees
 */
async function loadEmployees() {
    try {
        const result = await EmployeeAPI.getAll();

        console.log('Employees API result:', result); // Debug
        
        if (!result.success) throw new Error('Failed to load employees');

        // Extract the actual array from nested structure
        let employees = [];
        if (result.data) {
            // Your API returns: result.data.data (nested array)
            if (result.data.data && Array.isArray(result.data.data)) {
                employees = result.data.data;
            } 
            // Or maybe just result.data is the array
            else if (Array.isArray(result.data)) {
                employees = result.data;
            }
        }
        
        console.log('Extracted employees:', employees);
        
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

    // Check if state.employees is valid array
    if (!state.employees || !Array.isArray(state.employees)) {
        console.error('state.employees is not a valid array:', state.employees);
        container.innerHTML = `
            <div class="error-state">
                <h3>Data Error</h3>
                <p>Employees data is not in expected format</p>
                <button onclick="loadEmployees()" class="btn btn-primary">Retry</button>
            </div>
        `;
        return;
    }

    if (state.employees.length === 0) {
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
                    <th>Credits</th>
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
 * Row template for active employees
 */
function createEmployeeRow(emp) {
    // Use emp.department (not emp.department_name or other variations)
    // Use emp.position (not emp.position_title or other variations)
    // If these are null/undefined, provide fallback
    return `
        <tr>
            <td>${emp.employee_id || emp.empId || '(not set)'}</td>
            <td>${emp.name || emp.empName || 'No Name'}</td>
            <td>${emp.department || emp.empDepartment || '-'}</td>
            <td>${emp.position || emp.empPosition || '-'}</td>
            <td>${formatDate(emp.started_date || emp.start_date)}</td>
            <td><span class="badge badge-${emp.status}">${emp.status.toUpperCase()}</span></td>
            <td>${emp.leave_credits || 0} days</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editEmployee(${emp.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})">Delete</button>
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
    document.getElementById('employeeModal').classList.add('active');
}

/**
 * Close modal
 */
function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.remove('active');
}

/**
 * Handle create or update employee
 */
async function handleEmployeeSubmit(e) {
    e.preventDefault();

    const dbId = document.getElementById('employeeId').value.trim();

    const employeeData = {
        employee_id: document.getElementById('empId').value.trim(),
        name: document.getElementById('empName').value.trim(),
        department: document.getElementById('empDepartment')?.value || null,
        position: document.getElementById('empPosition')?.value || null,
        started_date: document.getElementById('empStartDate').value,
        end_date: document.getElementById('empEndDate').value || null,
        leave_credits: parseInt(document.getElementById('empLeaveCredits').value) || 15,
        status: document.getElementById('empStatus').value
    };
    console.log('Sending employee data:', employeeData); // Debug
    try {
        const result = dbId
            ? await EmployeeAPI.update(dbId, employeeData)
            : await EmployeeAPI.create(employeeData);

        if (!result.success) {
            // Show validation errors if available
            if (result.data && result.data.errors) {
                const errors = Object.entries(result.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
                alert(`Validation errors:\n${errors}`);
            } else {
                console.error(result.error);
                alert("Failed to save employee.");
            }
            return;
        }

        closeEmployeeModal();
        await loadEmployees();
        alert("Employee saved successfully!");

    } catch (err) {
        console.error(err);
        alert("Network error.");
    }
}

/**
 * Edit employee modal
 */
window.editEmployee = function (id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return alert("Employee not found!");

    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = emp.id;

    document.getElementById('empId').value = emp.employee_id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empDepartment').value = emp.department ?? '';
    document.getElementById('empPosition').value = emp.position ?? '';
    document.getElementById('empStartDate').value = emp.started_date;
    document.getElementById('empEndDate').value = emp.end_date || '';
    document.getElementById('empLeaveCredits').value = emp.leave_credits;
    document.getElementById('empStatus').value = emp.status;

    document.getElementById('employeeModal').classList.add('active');
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
                            <td>
                                <button class="btn btn-success btn-sm" onclick="restoreEmployee(${emp.id})">Restore</button>
                                <button class="btn btn-danger btn-sm" onclick="forceDeleteEmployee(${emp.id})">Delete Forever</button>
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
