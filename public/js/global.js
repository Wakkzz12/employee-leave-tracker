// global.js - Global Functions

// Global state for tracking original data
window.originalLeaveData = {};
window.originalEmployeeData = {};

/**
 * Close leave modal (global function)
 */
window.closeLeaveModal = function() {
    console.log('Closing leave modal...');
    const modal = document.getElementById('leaveModal');
    if (modal) {
        modal.classList.remove('active');
        
        // Reset form
        const form = document.getElementById('leaveForm');
        if (form) {
            form.reset();
        }
        
        // Hide delete button
        const deleteBtn = document.getElementById('deleteLeaveInModal');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
        
        // Clear stored original data
        delete window.originalLeaveData[document.getElementById('leaveId')?.value];
        
        console.log('Leave modal closed');
    }
};

/**
 * Close employee modal (global function)
 */
window.closeEmployeeModal = function() {
    console.log('Closing employee modal...');
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
        
        console.log('Employee modal closed');
    }
};

/**
 * Format date for input field (YYYY-MM-DD)
 */
window.formatDateForInput = function(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        console.error('Error formatting date:', e);
        return '';
    }
};

/**
 * Check if two values are different (for change detection)
 */
window.hasValueChanged = function(newValue, oldValue, isDate = false) {
    if (isDate) {
        const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
        const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
        return newDate !== oldDate;
    }
    return newValue !== (oldValue?.toString() || '');
};

window.formatDateForInput = function(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateString);
            return '';
        }
        
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};
/**
 * Show notification message
 */
window.showNotification = function(message, type = 'info') {
    // Remove any existing notifications
    const existing = document.querySelector('.global-notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `global-notification alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add styles for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .alert-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .alert-danger { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    `;
    document.head.appendChild(style);
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
};