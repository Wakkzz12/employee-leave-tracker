<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Employee Leave Tracker - AsiaPro Butuan</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
<body>
    <!-- Login Screen -->
    <div id="loginScreen" class="auth-container">
        <div class="auth-card">
            <div class="auth-logo">
                <h1>Leave Tracker System</h1>
                <p>For AsiaPro Butuan Employees</p>
            </div>
            <div id="loginError" class="error-message hidden"></div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email Address</label>
                    <input type="email" id="loginEmail" class="form-control" placeholder="your.name@asiaprobutuan.com" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="btn btn-primary">Sign In</button>
            </form>
            <div class="auth-switch">
                Don't have an account? <a id="showRegister">Register here</a>
            </div>
        </div>
    </div>

    <!-- Register Screen -->
    <div id="registerScreen" class="auth-container hidden">
        <div class="auth-card">
            <div class="auth-logo">
                <h1>Create Account</h1>
                <p>AsiaPro Butuan Employee Management</p>
            </div>
            <div id="registerError" class="error-message hidden"></div>
            <div id="registerSuccess" class="success-message hidden"></div>
            <form id="registerForm">
                <div class="form-group">
                    <label for="registerName">Full Name</label>
                    <input type="text" id="registerName" class="form-control" placeholder="Juan Dela Cruz" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email Address</label>
                    <input type="email" id="registerEmail" class="form-control" placeholder="your.name@asiaprobutuan.com" required>
                    <small style="color: var(--secondary); font-size: 12px; display: block; margin-top: 5px;">
                        Must use @asiaprobutuan.com email
                    </small>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Password</label>
                    <input type="password" id="registerPassword" class="form-control" placeholder="At least 8 characters" required>
                </div>
                <div class="form-group">
                    <label for="registerPasswordConfirm">Confirm Password</label>
                    <input type="password" id="registerPasswordConfirm" class="form-control" placeholder="Re-enter password" required>
                </div>
                <button type="submit" class="btn btn-primary">Create Account</button>
            </form>
            <div class="auth-switch">
                Already have an account? <a id="showLogin">Sign in here</a>
            </div>
        </div>
    </div>

    <!-- Dashboard -->
    <div id="dashboardContainer" class="dashboard-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-logo">
                <image src="{{ asset(('images/Asiapro-Horizontal-4.png')) }}" alt="AsiaPro Butuan Logo" />
            </div>
            <div class="nav-item active" data-section="dashboard">
                <span>Dashboard</span>
            </div>
            <div class="nav-item" data-section="employees">
                
                <span>Employees</span>
            </div>
            <div class="nav-item" data-section="manageLeaves">
                
                <span>Manage Leaves</span>
            </div>
            <div class="nav-item" data-section="requestLeave">
                
                <span>Request Leave</span>
            </div>
            <div class="nav-item" data-section="deletedLeaves">
                
                <span>Deleted Leaves</span>
            </div>
            <div class="nav-item" data-section="deletedEmployees">
                
                <span>Deleted Employees</span>
            </div>
            <div class="nav-item" data-section="employeeHistory">
               
                <span>Employee History</span>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Topbar -->
            <div class="topbar">
                <h1 id="pageTitle">Dashboard</h1>
                <div class="user-info">
                    <div class="user-avatar" id="userAvatar">A</div>
                    <span id="userName">Admin User</span>
                    <button class="logout-btn" id="logoutBtn">Logout</button>
                </div>
            </div>

            <!-- Dashboard Section -->
            <div id="dashboardSection" class="section">
                <div class="stats-grid">
                    <div class="stat-card" data-nav="employees">
                        <h3>Total Employees</h3>
                        <div class="stat-value" id="totalEmployees">0</div>
                    </div>
                    <div class="stat-card" data-nav="manageLeaves" style="border-left-color: var(--warning);">
                        <h3>Pending Leaves</h3>
                        <div class="stat-value" id="totalPending" style="color: var(--warning);">0</div>
                    </div>
                    <div class="stat-card" data-nav="manageLeaves" style="border-left-color: var(--success);">
                        <h3>Approved Leaves</h3>
                        <div class="stat-value" id="totalApproved" style="color: var(--success);">0</div>
                    </div>
                    <div class="stat-card" data-nav="deletedLeaves" style="border-left-color: var(--danger);">
                        <h3>Deleted Leaves</h3>
                        <div class="stat-value" id="totalDeleted" style="color: var(--danger);">0</div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h2>Recent Leave Requests</h2>
                    </div>
                    <div class="recent-requests" id="recentRequests">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Loading recent requests...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Employees Section -->
            <div id="employeesSection" class="section hidden">
                <div class="content-card">
                    <div class="card-header">
                        <h2>Employees Management</h2>
                        <button class="btn btn-success" id="addEmployeeBtn">+ Add Employee</button>
                    </div>
                    <div id="employeesTable"></div>
                </div>
            </div>

            <!-- Manage Leaves Section -->
            <div id="manageLeavesSection" class="section hidden">
                <div class="content-card">
                    <div class="card-header">
                        <h2>Manage Leave Requests</h2>
                    </div>
                    <div id="leavesTable"></div>
                </div>
            </div>

            <!-- Request Leave Section -->
            <div id="requestLeaveSection" class="section hidden">
                <div class="content-card">
                    <div class="card-header">
                        <h2>Request Leave</h2>
                    </div>
                    <div class="employee-search">
                        <div class="form-group">
                            <label>Search Employee</label>
                            <input type="text" id="employeeSearch" class="form-control" placeholder="Enter employee ID or name">
                        </div>
                        <div id="searchResults" class="search-results"></div>
                    </div>
                    <div id="leaveRequestForm" class="hidden">
                        <form id="createLeaveForm">
                            <input type="hidden" id="selectedEmployeeId">
                            <div class="form-group">
                                <label>Selected Employee</label>
                                <div class="employee-card selected" id="selectedEmployeeCard"></div>
                            </div>
                            <div class="form-group">
                                <label for="leaveType">Type of Leave</label>
                                <select id="leaveType" class="form-control" required>
                                    <option value="">Select leave type</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="vacation">Vacation Leave</option>
                                    <option value="emergency">Emergency Leave</option>
                                    <option value="maternity">Maternity Leave</option>
                                    <option value="paternity">Paternity Leave</option>
                                    <option value="bereavement">Bereavement Leave</option>
                                    <option value="unpaid">Unpaid Leave</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="startLeave">Start Date</label>
                                <input type="date" id="startLeave" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="endLeave">End Date</label>
                                <input type="date" id="endLeave" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Proof of Leave (Optional)</label>
                                <div class="file-upload" id="fileUpload">
                                    <p>📄 Click to upload file</p>
                                    <small>PDF, PNG, JPG (Max 5MB)</small>
                                    <input type="file" id="proofFile" accept=".pdf,.png,.jpg,.jpeg" class="hidden">
                                </div>
                                <div id="fileName" class="hidden" style="margin-top: 10px; color: var(--success);"></div>
                            </div>
                            <button type="submit" class="btn btn-primary">Submit Leave Request</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Deleted Leaves Section -->
            <div id="deletedLeavesSection" class="section hidden">
                <div class="content-card">
                    <div class="card-header">
                        <h2>Deleted Leaves & History</h2>
                    </div>
                    <div id="deletedLeavesTable"></div>
                </div>
            </div>

            <!-- Deleted Employees Section -->
            <div id="deletedEmployeesSection" class="section hidden">
                <div class="content-card">
                    <div class="card-header">
                        <h2>Deleted Employees</h2>
                            <p class="card-subtitle">Deleted employees can be back or force-delete</p>
                        </div>
                    <div id="deletedEmployeesTable"></div>
                </div>
            </div>

            <div id="employeeHistorySection" class="section hidden">
                <div class="content-card">
                    <div class="card-header">
                        <h2>Employee Leave History</h2>
                    </div>
                    
                    <div class="employee-search" style="position: relative;">
                        <div class="form-group">
                            <label>Search Employee</label>
                            <input 
                                type="text" 
                                id="historyEmployeeSearch" 
                                class="form-control" 
                                placeholder="Search employee by name or ID..."
                                autocomplete="off"
                            >
                        </div>
                        
                        <div id="historySearchResults" class="search-results"></div>
                    </div>
                    
                    <div id="historySelectedEmployeeContainer" style="display:none; margin-top: 10px;">
                        </div>
                    <div id="historyResults"></div>
                </div>
            </div>

   <!-- Add/Edit Employee Modal -->
<div id="employeeModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="employeeModalTitle">Add Employee</h2>
            <span class="close-modal" onclick="closeEmployeeModal()">&times;</span>
        </div>
        <form id="employeeForm">
            <input type="hidden" id="employeeId">
            <div class="modal-body">
                <div class="form-group">
                    <label for="empId">Employee ID</label>
                    <input type="text" id="empId" class="form-control" placeholder="EMP001">
                    <small class="form-text text-muted">Leave empty to keep current</small>
                </div>
                <div class="form-group">
                    <label for="empName">Full Name</label>
                    <input type="text" id="empName" class="form-control" placeholder="Juan Dela Cruz">
                    <small class="form-text text-muted">Leave empty to keep current</small>
                </div>
                <div class="form-group">
                    <label for="empDepartment">Department</label>
                    <input type="text" id="empDepartment" class="form-control" placeholder="IT Department">
                    <small class="form-text text-muted">Optional</small>
                </div>
                <div class="form-group">
                    <label for="empPosition">Position</label>
                    <input type="text" id="empPosition" class="form-control" placeholder="Software Developer">
                    <small class="form-text text-muted">Optional</small>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="empStartDate">Start Date</label>
                        <input type="date" id="empStartDate" class="form-control">
                        <small class="form-text text-muted">Leave empty to keep current</small>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="empEndDate">End Date</label>
                        <input type="date" id="empEndDate" class="form-control">
                        <small class="form-text text-muted">Leave blank if active</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="empLeaveBalance">Leave Balance</label>
                        <input type="number" id="empLeaveBalance" class="form-control" min="0" value="15">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="empStatus">Status</label>
                        <select id="empStatus" class="form-control">
                            <option value="regular">Regular</option>
                            <option value="permanent">Permanent</option>
                            <option value="contractual">Contractual</option>
                            <option value="resigned">Resigned</option>
                            <option value="terminated">Terminated</option>
                            <option value="awol">AWOL</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" id="deleteEmployeeInModal" style="display: none;">
                    Delete Employee
                </button>
                <div class="footer-right">
                    <button type="button" class="btn btn-secondary" onclick="closeEmployeeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </div>
        </form>
    </div>
</div>

    <!-- Edit Leave Modal -->
<div id="leaveModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Edit Leave Request</h2>
            <span class="close-modal" onclick="closeLeaveModal()">&times;</span>
        </div>
        <form id="leaveForm">
            <input type="hidden" id="leaveId">
            <div class="modal-body">
                <div class="form-group">
                    <label>Employee</label>
                    <input type="text" id="leaveEmpName" class="form-control" readonly>
                    <small class="form-text text-muted">Employee cannot be changed</small>
                </div>
                <div class="form-group">
                    <label for="editLeaveType">Type of Leave</label>
                    <select id="editLeaveType" class="form-control">
                        <option value="sick">Sick Leave</option>
                        <option value="vacation">Vacation Leave</option>
                        <option value="emergency">Emergency Leave</option>
                        <option value="maternity">Maternity Leave</option>
                        <option value="paternity">Paternity Leave</option>
                        <option value="bereavement">Bereavement Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                    </select>
                    <small class="form-text text-muted">Select to change, leave as is to keep current</small>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="editStartLeave">Start Date</label>
                        <input type="date" id="editStartLeave" class="form-control">
                        <small class="form-text text-muted">Leave empty to keep current</small>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editEndLeave">End Date</label>
                        <input type="date" id="editEndLeave" class="form-control">
                        <small class="form-text text-muted">Leave empty to keep current</small>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editLeaveStatus">Status</label>
                    <select id="editLeaveStatus" class="form-control">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div class="form-group hidden" id="rejectionReasonGroup">
                    <label for="rejectionReason">Rejection Reason</label>
                    <textarea id="rejectionReason" class="form-control" rows="3" 
                              placeholder="Provide reason for rejection (optional)"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" id="deleteLeaveInModal" style="display: none;">
                    Delete Leave Request
                </button>
                <div class="footer-right">
                    <button type="button" class="btn btn-secondary" id="cancelLeaveBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Leave</button>
                </div>
            </div>
            </div>
        </form>
    </div>
</div>

    <!-- JavaScript Modules (Load in order) -->
    <script src="{{ asset('js/config.js') }}"></script>
    <script src="{{ asset('js/global.js') }}"></script>
    <script src="{{ asset('js/utils.js') }}"></script>
    <script src="{{ asset('js/api.js') }}"></script>
    <script src="{{ asset('js/auth.js') }}"></script>
    <script src="{{ asset('js/navigation.js') }}"></script>
    <script src="{{ asset('js/dashboard.js') }}"></script>
    <script src="{{ asset('js/employees.js') }}"></script>
    <script src="{{ asset('js/leaves.js') }}"></script>
    <script src="{{ asset('js/request-leave.js') }}"></script>
    <script src="{{ asset('js/history.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>
</html>