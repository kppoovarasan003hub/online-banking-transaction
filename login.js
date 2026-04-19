// Login Logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    const loginForm = document.getElementById('loginForm');
    const spinner = document.getElementById('loadingSpinner');
    const submitBtn = document.querySelector('.login-button');
    const errorMsg = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value;
            const password = passwordInput.value;

            // Simple validation check
            if (!username || !password) return;

            // Hide previous error
            errorMsg.classList.add('hidden');

            // Show loading state
            spinner.classList.remove('hidden');
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Authenticating...';

            // Simulate login delay & redirect
            setTimeout(() => {
                if (username === 'Kishor' && password === '12340') {
                    // Store auth state (mock)
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', username);
                    
                    // Redirect to dashboard
                    window.location.href = 'index.html';
                } else {
                    // Reset UI on failure
                    spinner.classList.add('hidden');
                    submitBtn.disabled = false;
                    submitBtn.querySelector('span').textContent = 'Login';
                    
                    // Show error in UI
                    errorMsg.textContent = 'Wrong username and password';
                    errorMsg.classList.remove('hidden');
                }
            }, 1200);
        });
    }

    // Clear error on input
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            errorMsg.classList.add('hidden');
        });
    });

    // Check if close buttons work for visual demo
    document.querySelectorAll('.control-btn.close').forEach(btn => {
        btn.addEventListener('click', () => {
            const windowEl = document.querySelector('.login-window');
            windowEl.style.transform = 'scale(0.9) translateY(20px)';
            windowEl.style.opacity = '0';
            windowEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                alert('In a real app, this would close or exit the login flow.');
                windowEl.style.transform = '';
                windowEl.style.opacity = '';
            }, 500);
        });
    });
});
