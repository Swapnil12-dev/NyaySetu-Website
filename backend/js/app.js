// js/app.js - Global utilities for all pages

const checkAuthStatus = () => {
    const token = localStorage.getItem('nyay_setu_token');
    const authLinkContainer = document.getElementById('authLinkContainer');
    const authLink = document.getElementById('authLink');
    
    if (!authLinkContainer || !authLink) {
        // Not a page with the dynamic navbar structure (e.g., Testimonials page)
        return;
    }

    if (token) {
        // User is logged in
        authLinkContainer.innerHTML = `
            <span class="text-white mr-4 text-base hidden sm:inline">Welcome!</span>
            <button id="logoutBtn" class="bg-red-500 text-white py-1 px-4 rounded-full font-bold hover:bg-red-600 transition duration-150">
                Logout
            </button>
        `;
        
        // Add event listener to the newly created button
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    } else {
        // User is logged out
        authLink.textContent = 'Login / Signup';
        authLink.href = 'pages/auth.html';
    }
};

const handleLogout = () => {
    // 1. Clear the stored token
    localStorage.removeItem('nyay_setu_token');
    
    // 2. Redirect to the homepage
    // We navigate to the root index.html from wherever the user currently is
    window.location.href = '../index.html'; 
};

// Run the check when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', checkAuthStatus);
