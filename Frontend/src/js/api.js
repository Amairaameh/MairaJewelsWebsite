/* =============================================
   Maira Jewels - Secure Centralized API Client
   ============================================= */

const API_BASE_URL = (typeof window !== 'undefined' && window.__API_BASE_URL__) || 'https://maira-backend-mngd.onrender.com/api/v1';

class ApiService {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    getToken() {
        try {
            const token = localStorage.getItem('user_token') || sessionStorage.getItem('user_token') || localStorage.getItem('token') || sessionStorage.getItem('token') || null;
            if (!token) return null;

            // Check Token Expiration Timestamp
            const expiryStr = localStorage.getItem('user_token_expiry') || sessionStorage.getItem('user_token_expiry');
            if (expiryStr) {
                const expiryTime = parseInt(expiryStr, 10);
                if (!isNaN(expiryTime) && Date.now() > expiryTime) {
                    console.warn('[Auth Security] Token has expired. Performing automatic security logout.');
                    this.logout();
                    return null;
                }
            }

            return token;
        } catch (e) {
            return null;
        }
    }

    setToken(token, rememberMe = false) {
        try {
            if (token) {
                const duration = rememberMe ? (7 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000); // 7 days vs 24 hours
                const expiryTime = Date.now() + duration;

                localStorage.setItem('user_token', token);
                sessionStorage.setItem('user_token', token);
                localStorage.setItem('user_token_expiry', expiryTime.toString());
                sessionStorage.setItem('user_token_expiry', expiryTime.toString());
                localStorage.setItem('user_remember_me', rememberMe ? 'true' : 'false');
                sessionStorage.setItem('user_remember_me', rememberMe ? 'true' : 'false');
            } else {
                localStorage.removeItem('user_token');
                sessionStorage.removeItem('user_token');
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                localStorage.removeItem('user_token_expiry');
                sessionStorage.removeItem('user_token_expiry');
                localStorage.removeItem('user_remember_me');
                sessionStorage.removeItem('user_remember_me');
            }
        } catch (e) {
            console.error('Failed to set token', e);
        }
    }

    getUser() {
        try {
            const token = this.getToken();
            // Strict token enforcement: No valid unexpired token in storage = NO logged-in user!
            if (!token) {
                localStorage.removeItem('user_data');
                sessionStorage.removeItem('user_data');
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                return null;
            }
            const rawUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data') || localStorage.getItem('user') || sessionStorage.getItem('user');
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                if (parsed && (parsed.name || parsed.email)) {
                    return parsed;
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    setUser(user) {
        try {
            if (user) {
                const jsonStr = JSON.stringify(user);
                localStorage.setItem('user_data', jsonStr);
                sessionStorage.setItem('user_data', jsonStr);
                localStorage.setItem('user', jsonStr);
                sessionStorage.setItem('user', jsonStr);
                window.dispatchEvent(new CustomEvent('maira:user_updated', { detail: user }));
            } else {
                localStorage.removeItem('user_data');
                sessionStorage.removeItem('user_data');
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                window.dispatchEvent(new CustomEvent('maira:user_updated', { detail: null }));
            }
        } catch (e) {
            console.error('Failed to set user', e);
        }
    }

    logout() {
        this.setToken(null);
        this.setUser(null);
        window.dispatchEvent(new CustomEvent('maira:auth_logout'));
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // Instant logout & security purge on 401 Unauthorized / 403 Forbidden
                if (response.status === 401 || response.status === 403) {
                    console.warn(`[Security Alert] Session expired or invalid token (${response.status}). Instant logout triggered.`);
                    this.logout();
                    if (typeof window !== 'undefined' && window.location.pathname.includes('checkout')) {
                        window.location.href = 'login.html?redirect=checkout.html';
                    }
                }

                const errorMessage = data.message || `Request failed with status ${response.status}`;
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (err) {
            console.warn(`[API Error] ${options.method || 'GET'} ${url}:`, err.message);
            throw err;
        }
    }

    // Auth endpoints
    async register(userData) {
        const res = await this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
        const userObj = res.user || (res.data && res.data.user) || (res.data && res.data.name ? res.data : null);
        const token = res.token || (res.data && res.data.token) || res.jwt || (res.data && res.data.jwt) || res.accessToken || (res.data && res.data.accessToken) || (userObj ? `user_token_client_${userObj._id || userObj.id || Date.now()}` : null);

        if (token) this.setToken(token);
        if (userObj) this.setUser(userObj);
        return res;
    }

    async login(credentials) {
        const rememberMe = !!(credentials && (credentials.rememberMe || credentials.remember));
        const res = await this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
        const userObj = res.user || (res.data && res.data.user) || (res.data && res.data.name ? res.data : null);
        const token = res.token || (res.data && res.data.token) || res.jwt || (res.data && res.data.jwt) || res.accessToken || (res.data && res.data.accessToken) || (userObj ? `user_token_client_${userObj._id || userObj.id || Date.now()}` : null);

        if (token) this.setToken(token, rememberMe);
        if (userObj) this.setUser(userObj);
        return res;
    }

    async getMe() {
        const res = await this.request('/auth/me');
        const userObj = res.user || (res.data && res.data.user) || (res.data && res.data.name ? res.data : null) || (res.name ? res : null);
        if (userObj) this.setUser(userObj);
        return res;
    }

    async updateProfile(profileData) {
        const res = await this.request('/auth/updatedetails', {
            method: 'PUT',
            body: profileData
        }).catch(async () => {
            return await this.request('/auth/me', {
                method: 'PUT',
                body: profileData
            });
        });
        if (res.data && res.data.user) {
            this.setUser(res.data.user);
        }
        return res;
    }

    async updatePassword(passwordData) {
        return await this.request('/auth/updatepassword', {
            method: 'PUT',
            body: passwordData
        });
    }

    // Products endpoints
    async getProducts(params = {}) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.append(key, val);
            }
        });
        const queryString = query.toString() ? `?${query.toString()}` : '';
        return await this.request(`/products${queryString}`);
    }

    async getProductById(id) {
        return await this.request(`/products/${encodeURIComponent(id)}`);
    }

    // Orders endpoints
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: orderData
        });
    }

    async getMyOrders() {
        return await this.request('/orders/my-orders');
    }

    async getAllOrders() {
        return await this.request('/orders');
    }

    async getOrderById(id) {
        return await this.request(`/orders/${encodeURIComponent(id)}`);
    }

    // Inquiries / Contact
    async sendInquiry(inquiryData) {
        return await this.request('/inquiries', {
            method: 'POST',
            body: inquiryData
        });
    }

    async getCategories() {
        return await this.request('/categories');
    }

    async getFaqs(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = '/faqs' + (query ? '?' + query : '');
        return await this.request(endpoint);
    }
}

export const api = new ApiService();
if (typeof window !== 'undefined') {
    window.MairaAPI = api;
}
export default api;
