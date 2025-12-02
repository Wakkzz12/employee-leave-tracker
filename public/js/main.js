// main.js - Main Application Entry Point

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing Employee Leave Tracker System...');

    try {
        // Initialize all modules
        initAuth();
        initNavigation();
        initEmployees();
        initLeaves();
        initRequestLeave();
        initHistory();

        // Check authentication status
        checkAuth();

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
}

/**
 * Wait for DOM to be fully loaded
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

/**
 * Global unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
