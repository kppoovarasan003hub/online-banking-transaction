// Constants
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const transactionList = document.getElementById('transactionList');
const transferModal = document.getElementById('transferModal');
const openTransferBtn = document.getElementById('openTransfer');
const closeModalBtn = document.getElementById('closeModal');
const transferForm = document.getElementById('transferForm');
const balanceDisplay = document.querySelector('.balance-amount');

// Initialize
async function init() {
    await fetchBalance();
    await fetchTransactions();
}

// Fetch Balance
async function fetchBalance() {
    try {
        const response = await fetch(`${API_URL}/account`);
        const data = await response.json();
        balanceDisplay.textContent = '$' + data.balance.toLocaleString(undefined, { minimumFractionDigits: 2 });
    } catch (err) {
        console.error('Failed to fetch balance', err);
    }
}

// Fetch Transactions
async function fetchTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const transactions = await response.json();
        renderTransactions(transactions);
    } catch (err) {
        console.error('Failed to fetch transactions', err);
    }
}

// Render Transactions
function renderTransactions(transactions) {
    transactionList.innerHTML = '';
    transactions.forEach(tx => {
        const row = document.createElement('div');
        row.className = 'transaction-row';
        
        const isNegative = tx.amount < 0;
        const amountFormatted = (isNegative ? '-' : '+') + '$' + Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });

        row.innerHTML = `
            <div class="icon-box">
                <i data-lucide="${tx.icon}"></i>
            </div>
            <div class="transaction-info">
                <span class="name">${tx.name}</span>
                <span class="date">${tx.date}</span>
            </div>
            <div class="transaction-amount" style="color: ${isNegative ? 'inherit' : 'var(--success)'}">
                ${amountFormatted}
            </div>
            <div>
                <span class="status-badge status-${tx.status}">${tx.status}</span>
            </div>
        `;
        transactionList.appendChild(row);
    });
    lucide.createIcons();
}

// Modal Logic
openTransferBtn.addEventListener('click', () => {
    transferModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    transferModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === transferModal) transferModal.style.display = 'none';
});

// Form Submission
transferForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recipient = document.getElementById('recipientName').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    const confirmBtn = document.getElementById('confirmTransfer');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';

    try {
        const response = await fetch(`${API_URL}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: recipient, amount, category, icon: 'send' })
        });

        if (!response.ok) throw new Error('Transaction failed');

        // Update UI
        await fetchBalance();
        await fetchTransactions();
        
        // Close & Reset
        transferModal.style.display = 'none';
        transferForm.reset();
        showNotification(`Successfully sent $${amount} to ${recipient}`);

    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Transaction';
    }
});

function showNotification(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: var(--success); color: black;
        padding: 1rem 2rem; border-radius: 12px;
        font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 2000; animation: slideIn 0.3s ease forwards;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Mobile Sidebar Toggle ──────────────────────────────────────────────────
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    document.body.style.overflow = '';
}

if (menuToggle) menuToggle.addEventListener('click', openSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// Close sidebar on nav item click (mobile)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeSidebar();
    });
});

// ── Bottom Nav Active State ────────────────────────────────────────────────
document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        // Open transfer modal from bottom nav Transfers tab
        if (item.dataset.section === 'transactions' && transferModal) {
            transferModal.style.display = 'flex';
        }
    });
});

// ── Helper animations style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);

init();
