// config.js - Configuration and Constants

const CONFIG = {
    API_URL: 'http://127.0.0.1:8000/api',
    ALLOWED_EMAIL_DOMAIN: '@asiaprobutuan.com',
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    ALLOWED_FILE_TYPES: ['.pdf', '.png', '.jpg', '.jpeg', '.docx']
};

// Global State Management
const state = {
    user: null,
    employees: [],
    leaves: [],
    currentSection: 'dashboard'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, state };
}
