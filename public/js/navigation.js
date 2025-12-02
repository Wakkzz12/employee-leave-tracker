// navigation.js - Navigation Module

/**
 * Initialize navigation event listeners
 */
function initNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            navigateTo(section);
        });
    });

    // Dashboard stat cards navigation
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', () => {
            const nav = card.dataset.nav;
            if (nav) navigateTo(nav);
        });
    });
}

/**
 * Navigate to a section
 */
function navigateTo(section) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.add('hidden');
    });

    // Show target section
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        employees: 'Employees Management',
        manageLeaves: 'Manage Leave Requests',
        requestLeave: 'Request Leave',
        deletedLeaves: 'Deleted Leaves & History',
        deletedEmployees: 'Deleted Employees',
        employeeHistory: 'Employee Leave History'
    };

    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    state.currentSection = section;

    // Load section data
    loadSectionData(section);
}

/**
 * Load data for specific section
 */
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'manageLeaves':
            loadLeaves();
            break;
        case 'requestLeave':
            loadRequestLeave();
            break;
        case 'deletedLeaves':
            loadDeletedLeaves();
            break;
        case 'deletedEmployees':
            loadDeletedEmployees();
            break;
        case 'employeeHistory':
            loadEmployeeHistorySection();
            break;
        default:
            console.warn(`Unknown section: ${section}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        navigateTo,
        loadSectionData
    };
}