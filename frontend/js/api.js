const API = {
    baseUrl: '/api',

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Network response was not ok');
        return data;
    },

    auth: {
        async login(email, password) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
        },
        async register(userData) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        }
    },

    account: {
        async getDetails(userId) {
            return API.request(`/accounts/details?userId=${userId}`);
        },
        async getBeneficiaries(userId) {
            return API.request(`/accounts/beneficiaries?userId=${userId}`);
        },
        async addBeneficiary(userId, beneficiaryData) {
            return API.request('/accounts/beneficiaries', {
                method: 'POST',
                body: JSON.stringify({ userId, ...beneficiaryData })
            });
        }
    },

    transactions: {
        async transfer(transferData) {
            return API.request('/transactions/transfer', {
                method: 'POST',
                body: JSON.stringify(transferData)
            });
        },
        async getHistory(userId) {
            return API.request(`/transactions/history?userId=${userId}`);
        }
    }
};
