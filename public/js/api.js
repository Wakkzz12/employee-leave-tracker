// api.js - API Communication Functions

/**
 * Get CSRF token from Laravel
 */
async function getCsrfToken() {
    try {
        const response = await fetch('/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('CSRF token fetched:', response.ok);
        
        return response.ok;
    } catch (error) {
        console.error('Error getting CSRF token:', error);
        return false;
    }
}

/**
 * Make API request with proper headers for Laravel Sanctum
 */
async function apiRequest(url, options = {}) {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
    
    console.log('CSRF Token available:', !!csrfToken);
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrfToken
    };

    const config = {
        credentials: 'include', // Important for session cookies
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    // For FormData, remove Content-Type header (browser will set it)
    if (options.body && options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    console.log(`API Request to: ${url}`, { 
        method: config.method,
        hasCSRF: !!csrfToken
    });

    try {
        const response = await fetch(url, config);
        
        console.log(`API Response from ${url}:`, {
            status: response.status,
            url: response.url,
            redirected: response.redirected,
            ok: response.ok
        });
        
        // Check for redirect to login
        if (response.redirected && (response.url.includes('/login') || response.url.endsWith('/'))) {
            console.error('REDIRECTED TO LOGIN PAGE! CSRF or session issue.');
            // Don't redirect automatically, return error
            return {
                success: false,
                error: { message: 'Authentication required. Please refresh and login again.' },
                status: 401
            };
        }
        
        // Try to parse as JSON
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 500));
            
            // Check if it's HTML (login page)
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                return {
                    success: false,
                    error: { 
                        message: 'Server returned login page. Session may have expired.',
                        htmlError: true
                    },
                    status: response.status
                };
            }
            
            data = { message: 'Server returned non-JSON response' };
        }

        if (!response.ok) {
            throw {
                status: response.status,
                data
            };
        }

        return { success: true, data, status: response.status };
        
    } catch (error) {
        console.error('API Request Error:', error);
        
        return {
            success: false,
            error: error.data || error.message || 'Network error',
            status: error.status || 0
        };
    }
}

/**
 * Authentication API
 */
const AuthAPI = {
    async register(name, email, password, passwordConfirmation) {
        return await apiRequest(`${CONFIG.API_URL}/register`, {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            })
        });
    },

    async login(email, password) {
        return await apiRequest(`${CONFIG.API_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async logout() {
        return await apiRequest(`${CONFIG.API_URL}/logout`, {
            method: 'POST'
        });
    },

    async checkAuth() {
        return await apiRequest(`${CONFIG.API_URL}/user`);
    }
};

/**
 * Dashboard API
 */
const DashboardAPI = {
    async getStats() {
        return await apiRequest(`${CONFIG.API_URL}/dashboard`);
    }
};

/**
 * Employee API
 */
const EmployeeAPI = {
    async getAll() {
        return await apiRequest(`${CONFIG.API_URL}/employees`);
    },

    async getById(id) {
        return await apiRequest(`${CONFIG.API_URL}/employees/${id}`);
    },

    async create(employeeData) {
        return await apiRequest(`${CONFIG.API_URL}/employees`, {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    },

    // In api.js - Update EmployeeAPI.update method
async update(id, employeeData) {
    try {
        console.log(`Updating employee ${id} with data:`, employeeData);
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        
        if (!csrfToken) {
            return {
                success: false,
                error: { message: 'CSRF token missing' },
                status: 403
            };
        }
        
        // Clean data - remove empty strings
        const cleanData = Object.fromEntries(
            Object.entries(employeeData).filter(([_, value]) => 
                value !== '' && value !== null && value !== undefined
            )
        );
        
        console.log('Cleaned employee data:', cleanData);
        
        const response = await fetch(`${CONFIG.API_URL}/employees/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(cleanData)
        });
        
        let data;
        const text = await response.text();
        
        // Check for HTML response (login page)
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            return {
                success: false,
                error: { message: 'Authentication issue. Please refresh.' },
                status: 401
            };
        }
        
        // Parse JSON
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: 'Invalid JSON response' };
        }
        
        // Handle validation errors
        if (response.status === 422) {
            return {
                success: false,
                data: data,
                error: data.errors || data.message || 'Validation failed',
                status: response.status
            };
        }
        
        return {
            success: response.ok,
            data: data,
            error: !response.ok ? data : null,
            status: response.status
        };
        
    } catch (error) {
        console.error('Network error in EmployeeAPI.update:', error);
        return {
            success: false,
            error: { message: error.message || 'Network error' },
            status: 0
        };
    }
},

    async delete(id) {
        return await apiRequest(`${CONFIG.API_URL}/employees/${id}`, {
            method: 'DELETE'
        });
    },

    async deleted() {
        const result = await apiRequest(`${CONFIG.API_URL}/employees/deleted`);
        
        console.log('EmployeeAPI.deleted() raw result:', result); // Debug
        
        // Normalize the response structure
        if (result.success && result.data) {
            // If data is nested inside result.data.data
            if (result.data.data && Array.isArray(result.data.data)) {
                console.log('Extracting from result.data.data');
                result.data = result.data.data;
            }
            // If data has success wrapper with nested data
            else if (result.data.success && result.data.data && Array.isArray(result.data.data)) {
                console.log('Extracting from result.data.data (success wrapper)');
                result.data = result.data.data;
            }
            // If result.data is already an array, keep it
            else if (Array.isArray(result.data)) {
                console.log('result.data is already array');
                // No change needed
            }
            // If result.data is an object but not what we expect
            else {
                console.log('Unexpected data structure:', result.data);
                result.data = []; // Fallback to empty array
            }
        }
        
        console.log('EmployeeAPI.deleted() normalized result:', result); // Debug
        return result;
    },

    async restore(id) {
        return await apiRequest(`${CONFIG.API_URL}/employees/${id}/restore`, {
            method: 'POST'
        });
    },
    
    async forceDelete(id) {
        return await apiRequest(`${CONFIG.API_URL}/employees/${id}/force`, {
            method: 'DELETE'
        });
    }
};

/**
 * Leave Request API
 */
const LeaveAPI = {
    async getAll() {
        return await apiRequest(`${CONFIG.API_URL}/leave-requests`);
    },

    async create(formData) {
        try {
            console.log('Sending leave request...');
            
            // Get CSRF token from meta tag (Laravel puts it in the HTML)
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            console.log('CSRF Token available:', !!csrfToken);
            
            if (!csrfToken) {
                console.error('CSRF token not found!');
                return {
                    success: false,
                    error: { message: 'CSRF token missing. Please refresh the page.' },
                    status: 403
                };
            }
            
            // Add CSRF token to FormData
            formData.append('_token', csrfToken);
            
            // Or add it as a header (both work)
            const headers = {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
                // Don't set Content-Type for FormData
            };
            
            console.log('Making request with CSRF token:', csrfToken.substring(0, 10) + '...');
            
            const response = await fetch(`${CONFIG.API_URL}/leave-requests`, {
                method: 'POST', 
                credentials: 'include', // Important for session cookies
                headers: headers,
                body: formData
            });
            
            console.log('Response:', {
                status: response.status,
                url: response.url,
                redirected: response.redirected,
                ok: response.ok
            });
            
            // Read response
            const responseText = await response.text();
            console.log('Response (first 500 chars):', responseText.substring(0, 500));
            
            // Check if it's HTML redirect
            if (responseText.includes('<!DOCTYPE') || responseText.includes('<html') || 
                response.url.includes('/login') || response.url.endsWith('/')) {
                console.error('Got HTML/redirect instead of JSON. CSRF issue?');
                return {
                    success: false,
                    error: { 
                        message: 'Authentication or CSRF issue. Please refresh and try again.',
                        gotHtml: true,
                        preview: responseText.substring(0, 200)
                    },
                    status: response.status
                };
            }
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Parsed JSON response:', data);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                data = { 
                    message: 'Invalid JSON response from server',
                    raw: responseText.substring(0, 200)
                };
            }
            
            return {
                success: response.ok,
                data: data,
                error: !response.ok ? data : null,
                status: response.status
            };
            
        } catch (error) {
            console.error('Network error in LeaveAPI.create:', error);
            return {
                success: false,
                error: { message: error.message || 'Network error' },
                status: 0
            };
        }
    },
    

    // In LeaveAPI.update method, replace with this:

async update(id, leaveData) {
    try {
        console.log(`Updating leave ${id} with data:`, leaveData);
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        
        if (!csrfToken) {
            return {
                success: false,
                error: { message: 'CSRF token missing' },
                status: 403
            };
        }
        
        const cleanData = Object.fromEntries(
            Object.entries(leaveData).filter(([_, value]) => 
                value !== '' && value !== null && value !== undefined
            )
        );
        
        console.log('Sending cleaned data:', cleanData);
        
        const response = await fetch(`${CONFIG.API_URL}/leave-requests/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(cleanData)
        });
        
        console.log('Update response status:', response.status);
        
        // Read the response text
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            data = { 
                message: 'Invalid JSON response',
                raw: responseText.substring(0, 500)
            };
        }
        
        if (!response.ok) {
            console.error('Server error response:', data);
            
            // If it's a 500 error, show more details
            if (response.status === 500) {
                return {
                    success: false,
                    data: data,
                    error: {
                        message: data.message || 'Internal server error',
                        debug: data.debug || null
                    },
                    status: response.status
                };
            }
            
            return {
                success: false,
                data: data,
                error: data.errors || data.message || 'Update failed',
                status: response.status
            };
        }
        
        return {
            success: true,
            data: data,
            error: null,
            status: response.status
        };
        
    } catch (error) {
        console.error('Network error in LeaveAPI.update:', error);
        return {
            success: false,
            error: { message: error.message || 'Network error' },
            status: 0
        };
    }
},

    async delete(id) {
        return await apiRequest(`${CONFIG.API_URL}/leave-requests/${id}`, {
            method: 'DELETE'
        });
    },

    async getHistory() {
        return await apiRequest(`${CONFIG.API_URL}/leave-requests/history`);
    },

    async getEmployeeHistory(employeeId) {
        return await apiRequest(`${CONFIG.API_URL}/leave-requests/employee/${employeeId}`);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCsrfToken,
        apiRequest,
        AuthAPI,
        DashboardAPI,
        EmployeeAPI,
        LeaveAPI
    };
}
