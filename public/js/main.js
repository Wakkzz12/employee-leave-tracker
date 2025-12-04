// main.js - Main Application Entry Point

/**
 * Initialize the application
 */
/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing Employee Leave Tracker System...');
    
    try {
        // Initialize modules one by one with try-catch
        const modules = [
            { name: 'Auth', init: initAuth },
            { name: 'Navigation', init: initNavigation },
            { name: 'Employees', init: initEmployees },
            { name: 'Leaves', init: initLeaves },
            { name: 'Request Leave', init: initRequestLeave },
            { name: 'History', init: initHistory }
        ];
        
        modules.forEach(module => {
            try {
                console.log(`Initializing ${module.name} module...`);
                module.init();
                console.log(`✓ ${module.name} module initialized`);
            } catch (error) {
                console.warn(`⚠ ${module.name} module initialization warning:`, error.message);
                // Continue with other modules even if one fails
            }
        });

        // Check authentication status
        try {
            checkAuth();
        } catch (error) {
            console.warn('Auth check warning:', error.message);
        }

        console.log('Application initialization complete');
        
    } catch (error) {
        console.error('Critical error initializing application:', error);
        // Only show alert for critical errors
        if (!error.message.includes('null') && !error.message.includes('undefined') && !error.message.includes('addEventListener')) {
            alert('Failed to initialize application. Please refresh the page.');
        }
    }
}

        /**
         * Wait for DOM to be fully loaded
         */
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM fully loaded, initializing app...');
            // Small delay to ensure all elements are ready
            setTimeout(initApp, 50);
        });

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
