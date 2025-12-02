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
        showDetailedError
    };
}