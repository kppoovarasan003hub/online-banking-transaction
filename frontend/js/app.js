// State Management
const State = {
    user: JSON.parse(localStorage.getItem('zenith_user')),
    token: localStorage.getItem('zenith_token'),
    currentPage: 'login',
    account: null
};

// DOM Elements
const mainContent = document.getElementById('pageContent');
const sidebar = document.getElementById('sidebar');
const mainArea = document.getElementById('mainContent');
const logoutBtn = document.getElementById('logoutBtn');

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    if (State.user && State.token) {
        showDashboard();
    } else {
        showLoginPage();
    }
});

// Routing Logic
function showPage(pageName) {
    State.currentPage = pageName;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    switch(pageName) {
        case 'dashboard': renderDashboard(); break;
        case 'transfer': renderTransfer(); break;
        case 'history': renderHistory(); break;
        case 'beneficiaries': renderBeneficiaries(); break;
        case 'profile': renderProfile(); break;
    }
}

// Page Renderers
function showLoginPage() {
    sidebar.classList.add('hidden');
    mainArea.classList.add('full-width');
    
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-card fade-in">
                <div class="logo" style="justify-content: center; margin-bottom: 2rem;">
                    <i data-lucide="shield-check"></i>
                    <span>ZENITH BANK</span>
                </div>
                <h2 style="text-align:center; margin-bottom: 2rem;">Welcome Back</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="email" placeholder="name@company.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Login Now</button>
                    <p style="text-align:center; margin-top: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                        New here? <a href="#" onclick="showRegisterPage()" style="color: var(--accent-primary);">Create an account</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    lucide.createIcons();

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await API.auth.login(email, password);
            State.user = data.user;
            State.token = data.token;
            localStorage.setItem('zenith_user', JSON.stringify(data.user));
            localStorage.setItem('zenith_token', data.token);
            showDashboard();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

function showRegisterPage() {
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-card fade-in">
                <h2 style="margin-bottom: 2rem; text-align:center;">Create Account</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Register Account</button>
                    <p style="text-align:center; margin-top: 1.5rem; color: var(--text-secondary); font-size: 0.875rem;">
                        Already have an account? <a href="#" onclick="showLoginPage()" style="color: var(--accent-primary);">Sign In</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    lucide.createIcons();
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await API.auth.register({ name, email, password });
            showToast('Registration successful! Please login.');
            showLoginPage();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

async function showDashboard() {
    sidebar.classList.remove('hidden');
    mainArea.classList.remove('full-width');
    showPage('dashboard');
}

async function renderDashboard() {
    try {
        const account = await API.account.getDetails(State.user.id);
        const history = await API.transactions.getHistory(State.user.id);
        
        mainContent.innerHTML = `
            <div class="page-container">
                <header style="margin-bottom: 2rem;">
                    <h1>Welcome back, ${State.user.name.split(' ')[0]}!</h1>
                    <p style="color: var(--text-secondary);">Manage your assets and transactions in real-time.</p>
                </header>

                <div class="dashboard-grid">
                    <div class="card balance-card span-2">
                        <span class="balance-label">Current Balance</span>
                        <div class="balance-value">₹${account.balance.toLocaleString('en-IN')}</div>
                        <p style="color: var(--text-secondary);">Account: ${account.accountNumber}</p>
                    </div>
                    <div class="card">
                        <h3>Quick Actions</h3>
                        <div style="display:flex; flex-direction:column; gap: 10px; margin-top: 20px;">
                            <button class="btn" onclick="showPage('transfer')" style="background: rgba(0,229,255,0.1); color: var(--accent-primary);">
                                <i data-lucide="send"></i> Send Money
                            </button>
                            <button class="btn" onclick="showPage('history')" style="background: rgba(255,255,255,0.05); color: white;">
                                <i data-lucide="history"></i> View History
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
                        <h3>Recent Transactions</h3>
                        <a href="#" onclick="showPage('history')" style="color: var(--accent-primary); font-size: 0.8125rem;">View All</a>
                    </div>
                    <div id="txList">
                        ${history.length ? history.slice(0, 5).map(tx => `
                            <div style="display:flex; justify-content:space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                                <div>
                                    <p style="font-weight:600;">${tx.description || 'General Transfer'}</p>
                                    <p style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                                <div style="font-weight: 700; color: ${tx.receiverId === State.user.id ? 'var(--success)' : 'var(--error)'}">
                                    ${tx.receiverId === State.user.id ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}
                                </div>
                            </div>
                        `).join('') : '<p style="color:var(--text-secondary); text-align:center; padding: 2rem;">No recent transactions</p>'}
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function renderTransfer() {
    try {
        const beneficiaries = await API.account.getBeneficiaries(State.user.id);
        
        mainContent.innerHTML = `
            <div class="page-container" style="max-width: 600px;">
                <h1 style="margin-bottom: 2rem;">Transfer Money</h1>
                <div class="card">
                    <form id="transferForm">
                        <div class="form-group">
                            <label>Beneficiary</label>
                            <select id="receiverAcc">
                                <option value="">Select Beneficiary</option>
                                ${beneficiaries.map(b => `<option value="${b.accountNumber}">${b.name} (${b.accountNumber})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount (₹)</label>
                            <input type="number" id="trAmount" placeholder="0.00" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Purpose</label>
                            <input type="text" id="trPurpose" placeholder="e.g. Rent, Gift">
                        </div>
                        <button type="submit" class="btn btn-primary">Confirm Transfer</button>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('transferForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const receiverAccount = document.getElementById('receiverAcc').value;
            const amount = parseFloat(document.getElementById('trAmount').value);
            const description = document.getElementById('trPurpose').value;

            if (!receiverAccount) {
                showToast('Please select a beneficiary', 'error');
                return;
            }

            try {
                await API.transactions.transfer({
                    senderId: State.user.id,
                    receiverAccount,
                    amount,
                    description
                });
                showToast('Money transferred successfully!');
                showDashboard();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function renderHistory() {
    try {
        const history = await API.transactions.getHistory(State.user.id);
        mainContent.innerHTML = `
            <div class="page-container">
                <header style="margin-bottom: 2rem;">
                    <h1>Transaction History</h1>
                    <p style="color: var(--text-secondary);">Browse through all your transactions.</p>
                </header>
                <div class="card">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="text-align: left; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border);">
                            <tr>
                                <th style="padding: 1rem 0;">Date</th>
                                <th>Description</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.map(tx => `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 1rem 0;">${new Date(tx.date).toLocaleDateString()}</td>
                                    <td>${tx.description || 'Transfer'}</td>
                                    <td style="text-align: right; font-weight: 700; color: ${tx.receiverId === State.user.id ? 'var(--success)' : 'var(--error)'}">
                                        ${tx.receiverId === State.user.id ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function renderBeneficiaries() {
    try {
        const beneficiaries = await API.account.getBeneficiaries(State.user.id);
        mainContent.innerHTML = `
            <div class="page-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                    <h1>Beneficiaries</h1>
                    <button class="btn btn-primary" onclick="showAddBeneficiary()" style="width: auto;">+ Add New</button>
                </div>
                <div class="dashboard-grid">
                    ${beneficiaries.map(b => `
                        <div class="card">
                            <h3>${b.name}</h3>
                            <p style="color:var(--text-secondary);">Account: ${b.accountNumber}</p>
                            <p style="color:var(--text-secondary);">IFSC: ${b.ifsc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function showAddBeneficiary() {
    mainContent.innerHTML = `
        <div class="page-container" style="max-width: 500px;">
            <h1>Add Beneficiary</h1>
            <div class="card">
                <form id="beneficiaryForm">
                    <div class="form-group"><label>Name</label><input type="text" id="bName" required></div>
                    <div class="form-group"><label>Account Number</label><input type="text" id="bAcc" required></div>
                    <div class="form-group"><label>IFSC</label><input type="text" id="bIfsc" required></div>
                    <button type="submit" class="btn btn-primary">Save Beneficiary</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('beneficiaryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await API.account.addBeneficiary(State.user.id, {
                name: document.getElementById('bName').value,
                accountNumber: document.getElementById('bAcc').value,
                ifsc: document.getElementById('bIfsc').value
            });
            showToast('Beneficiary added!');
            showPage('beneficiaries');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

function renderProfile() {
    mainContent.innerHTML = `
        <div class="page-container" style="max-width: 600px;">
            <h1>Profile Settings</h1>
            <div class="card">
                <div class="form-group"><label>Name</label><input type="text" value="${State.user.name}" disabled></div>
                <div class="form-group"><label>Email</label><input type="email" value="${State.user.email}" disabled></div>
                <button class="btn" style="background:rgba(255,255,255,0.05);">Change Password</button>
            </div>
        </div>
    `;
}

// Helper: Show Toast
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = type === 'error' ? 'rgba(255, 75, 75, 0.1)' : 'rgba(16, 185, 129, 0.1)';
    toast.style.color = type === 'error' ? 'var(--error)' : 'var(--success)';
    toast.style.borderColor = type === 'error' ? 'rgba(255, 75, 75, 0.2)' : 'rgba(16, 185, 129, 0.2)';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Navigation Listeners
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) showPage(page);
    });
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('zenith_user');
    localStorage.removeItem('zenith_token');
    State.user = null;
    State.token = null;
    showLoginPage();
});
