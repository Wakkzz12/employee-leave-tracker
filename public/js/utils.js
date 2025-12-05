// utils.js - Utility Functions

/**
 * Display error message
 */
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) {
        console.error(`Element ${elementId} not found`);
        return;
    }
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

/**
 * Display success message
 */
function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) {
        console.error(`Element ${elementId} not found`);
        return;
    }
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

/**
 * Format date to readable string
 */
function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format full date and time as readable text
 * Example: "Oct 20, 2025 - 2:45 PM"
 */
function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}


/**
 * Get initials from full name
 */
function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Validate email domain
 */
function isValidEmailDomain(email) {
    return email.endsWith(CONFIG.ALLOWED_EMAIL_DOMAIN);
}

/**
 * Validate file size and type
 */
function validateFile(file) {
    const errors = [];
    
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        errors.push('File size exceeds 5MB limit');
    }
    
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!CONFIG.ALLOWED_FILE_TYPES.includes(extension)) {
        errors.push('Invalid file type. Allowed: PDF, PNG, JPG');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Show alert with error details - UPDATED for Laravel FormRequest
 */
function showDetailedError(errorData) {
    console.log('showDetailedError received:', errorData);
    
    let errorMessage = 'Error:\n';
    
    if (errorData) {
        // Case 1: Laravel FormRequest validation errors
        if (errorData.errors && typeof errorData.errors === 'object') {
            // Flatten all error messages
            const allErrors = [];
            Object.values(errorData.errors).forEach(errorArray => {
                if (Array.isArray(errorArray)) {
                    allErrors.push(...errorArray);
                } else {
                    allErrors.push(errorArray);
                }
            });
            
            if (allErrors.length > 0) {
                errorMessage += allErrors.join('\n');
            } else if (errorData.message) {
                errorMessage += errorData.message;
            }
        }
        // Case 2: Simple error message
        else if (errorData.message) {
            errorMessage += errorData.message;
        }
        // Case 3: String error
        else if (typeof errorData === 'string') {
            errorMessage += errorData;
        }
        // Case 4: Array of errors
        else if (Array.isArray(errorData)) {
            errorMessage += errorData.join('\n');
        }
        // Case 5: Unknown format
        else {
            console.log('Unknown error format, showing raw:', errorData);
            errorMessage += JSON.stringify(errorData, null, 2);
        }
    } else {
        errorMessage += 'No error details available';
    }
    
    alert(errorMessage);
}
// Add to utils.js

/**
 * Check if form has changes compared to original data
 */
function hasFormChanges(formId, originalData, fieldMappings) {
    const changes = {};
    
    for (const [formField, dataField] of Object.entries(fieldMappings)) {
        const input = document.getElementById(formField);
        if (!input) continue;
        
        const newValue = input.value;
        const oldValue = originalData[dataField];
        
        // Special handling for dates
        if (dataField.includes('_date') || dataField.includes('_leave')) {
            const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
            const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
            if (newDate !== oldDate) {
                changes[dataField] = newValue;
            }
        } else if (newValue !== (oldValue?.toString() || '')) {
            changes[dataField] = newValue;
        }
    }
    
    return changes;
}

/**
 * Extract only changed fields from form
 */
function extractChangedFields(originalData, fieldConfigs) {
    const changes = {};
    
    fieldConfigs.forEach(config => {
        const { fieldId, dataField, isDate = false } = config;
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const newValue = input.value;
        const oldValue = originalData[dataField];
        
        if (isDate) {
            const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
            const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
            if (newDate !== oldDate) {
                changes[dataField] = newValue || null;
            }
        } else if (newValue !== (oldValue?.toString() || '')) {
            changes[dataField] = newValue || null;
        }
    });
    
    return changes;
}

/**
 * Clear empty values from object
 */
function cleanObject(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => 
            value !== '' && value !== null && value !== undefined
        )
    );
}

/**
 * Handle API validation errors
 */
function handleValidationErrors(errorData) {
    if (errorData.errors && typeof errorData.errors === 'object') {
        const errorMessages = [];
        Object.values(errorData.errors).forEach(errorArray => {
            if (Array.isArray(errorArray)) {
                errorMessages.push(...errorArray);
            } else {
                errorMessages.push(errorArray);
            }
        });
        
        if (errorMessages.length > 0) {
            return errorMessages.join('\n');
        }
    }
    
    return errorData.message || 'Validation error occurred';
}

// utils.js - ADD THESE FUNCTIONS

/**
 * Compare two values for change detection
 */
function valuesChanged(newValue, oldValue, isDate = false) {
    if (isDate) {
        const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
        const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
        return newDate !== oldDate;
    }
    
    // Handle number comparisons
    if (typeof oldValue === 'number') {
        const newNum = parseFloat(newValue);
        return !isNaN(newNum) && newNum !== oldValue;
    }
    
    // Handle string comparisons
    return newValue !== (oldValue?.toString() || '');
}

/**
 * Extract changed fields from form
 */
function extractFormChanges(originalData, fieldMappings) {
    const changes = {};
    
    fieldMappings.forEach(mapping => {
        const { fieldId, dataField, isDate = false, defaultValue = null } = mapping;
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const newValue = input.value.trim();
        const oldValue = originalData[dataField];
        
        // Check if value changed
        if (valuesChanged(newValue, oldValue, isDate)) {
            // Handle empty values
            if (newValue === '') {
                changes[dataField] = defaultValue;
            } else {
                changes[dataField] = isDate ? newValue : 
                                   dataField.includes('credits') ? parseInt(newValue) || 0 : newValue;
            }
        }
    });
    
    return changes;
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 12px 20px;
        border-radius: 4px;
        background: ${type === 'success' ? '#d4edda' : 
                     type === 'error' ? '#f8d7da' : 
                     type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : 
                type === 'error' ? '#721c24' : 
                type === 'warning' ? '#856404' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : 
                          type === 'error' ? '#f5c6cb' : 
                          type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 20px; cursor: pointer; color: inherit;">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showError,
        showSuccess,
        formatDate,
        formatDateTime,
        getInitials,
        isValidEmailDomain,
        validateFile,
        capitalize,
        showDetailedError,
        hasFormChanges,
        extractChangedFields,
        cleanObject,
        handleValidationErrors,
        extractFormChanges,
        showNotification 
    };
}