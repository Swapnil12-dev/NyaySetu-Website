// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authStatusMessage = document.getElementById('authStatusMessage');
    const authPrompt = document.getElementById('authPrompt');

    // --- Tab Switching Logic ---
    const showTab = (type) => {
        if (type === 'login') {
            loginTab.classList.add('border-blue-600', 'text-blue-600');
            loginTab.classList.remove('border-transparent', 'text-gray-500');
            signupTab.classList.remove('border-blue-600', 'text-blue-600');
            signupTab.classList.add('border-transparent', 'text-gray-500');
            
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            authPrompt.textContent = 'Please log in to continue.';
        } else {
            signupTab.classList.add('border-blue-600', 'text-blue-600');
            signupTab.classList.remove('border-transparent', 'text-gray-500');
            loginTab.classList.remove('border-blue-600', 'text-blue-600');
            loginTab.classList.add('border-transparent', 'text-gray-500');

            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            authPrompt.textContent = 'Create your free account.';
        }
        authStatusMessage.classList.add('hidden');
    };

    loginTab.addEventListener('click', () => showTab('login'));
    signupTab.addEventListener('click', () => showTab('signup'));

    // --- Helper Function for Status Messages ---
    const displayStatus = (message, type = 'error') => {
        authStatusMessage.textContent = message;
        authStatusMessage.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
        
        if (type === 'success') {
            authStatusMessage.classList.add('bg-green-100', 'text-green-700');
        } else {
            authStatusMessage.classList.add('bg-red-100', 'text-red-700');
        }
    };

    // --- Redirection Logic ---
    const redirectToRolePage = (role, token) => {
        // Store the JWT for future API calls
        localStorage.setItem('nyay_setu_token', token);

        if (role === 'lawyer') {
            // Lawyers go to their profile completion page
            window.location.href = 'lawyer-info.html';
        } else if (role === 'client') {
            // Clients go directly to the search page
            window.location.href = 'client-search.html';
        }
    };

    // --- API Submission Handler ---
    const handleAuth = async (endpoint, payload) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                displayStatus(data.message || 'Authentication successful!', 'success');
                
                // Redirect after a slight delay
                setTimeout(() => {
                    redirectToRolePage(data.role, data.token);
                }, 1000);

            } else {
                displayStatus(`Error: ${data.message || 'Server error occurred.'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            displayStatus('Network error: Could not reach the server. Is the server running?');
        }
    };

    // --- Form Event Listeners ---
    
    // 1. SIGNUP Submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        displayStatus('Creating account...', 'info'); // 'info' is not styled yet, but shows activity

        const payload = {
            email: document.getElementById('signupEmail').value.trim(),
            password: document.getElementById('signupPassword').value,
            role: document.getElementById('signupRole').value
        };
        handleAuth('/api/auth/register', payload);
    });

    // 2. LOGIN Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        displayStatus('Logging in...', 'info');

        const payload = {
            email: document.getElementById('loginEmail').value.trim(),
            password: document.getElementById('loginPassword').value,
        };
        handleAuth('/api/auth/login', payload);
    });

    // Initialize to login view
    showTab('login');
});
