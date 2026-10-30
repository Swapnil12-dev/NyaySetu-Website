// js/lawyerAuth.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('lawyerInfoForm');
    const statusMessage = document.getElementById('statusMessage');

    // Check for existing token and ensure the user is authenticated before proceeding
    const token = localStorage.getItem('nyay_setu_token');
    if (!token) {
        statusMessage.textContent = 'Session expired or not logged in. Redirecting to login...';
        statusMessage.className = 'status-message error';
        statusMessage.style.display = 'block';
        
        // If no token, redirect back to login page
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
        return; 
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show "loading" status
        statusMessage.textContent = 'Saving profile... please wait.';
        statusMessage.className = 'status-message';
        statusMessage.style.display = 'block';

        // Collect all form data into an object
        const formData = {
            fullName: document.getElementById('fullName').value,
            // NOTE: contactEmail is no longer needed here as the email is tracked by the user_id via the JWT
            barID: document.getElementById('barID').value,
            practiceArea: document.getElementById('practiceArea').value,
            experience: parseInt(document.getElementById('experience').value, 10),
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
        };

        try {
            // New endpoint: /api/lawyer/complete-profile and method is POST
            const response = await fetch('/api/lawyer/complete-profile', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // CRUCIAL: Attach the JWT token to the Authorization header
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                statusMessage.textContent = data.message || 'Profile saved successfully!';
                statusMessage.className = 'status-message success';
                
                // Redirect to a dashboard or home after successful profile completion
                setTimeout(() => {
                    form.reset();
                    window.location.href = '../index.html'; 
                }, 2000); 

            } else if (response.status === 401 || response.status === 403) {
                // Token invalid or user not authorized (Lawyer only route)
                localStorage.removeItem('nyay_setu_token');
                statusMessage.textContent = 'Authentication failed. Please log in again.';
                statusMessage.className = 'status-message error';
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 1500);
            } 
            else {
                // Other Server Error (e.g., duplicate Bar ID)
                statusMessage.textContent = `Error: ${data.message || 'Server reported an issue.'}`;
                statusMessage.className = 'status-message error';
            }
        } catch (error) {
            // Network Error
            console.error('Network or Fetch Error:', error);
            statusMessage.textContent = 'Network error: Could not connect to the server.';
            statusMessage.className = 'status-message error';
        }
    });
});
