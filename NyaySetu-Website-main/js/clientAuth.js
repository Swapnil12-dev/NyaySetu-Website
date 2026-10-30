// js/clientAuth.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clientSearchForm');
    const matchesContainer = document.getElementById('lawyerMatches');

    const token = localStorage.getItem('nyay_setu_token');
    
    if (!token) {
        matchesContainer.innerHTML = `
            <p class="text-center text-red-500 p-6 bg-white rounded-lg shadow">
                You must be logged in to search for lawyers. Redirecting to login...
            </p>`;
        
        // If no token, redirect back to login page
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
        return;
    }

    // Function to generate and display the lawyer cards (unchanged)
    const renderMatches = (lawyers) => {
        matchesContainer.innerHTML = ''; 

        if (lawyers.length === 0) {
            matchesContainer.innerHTML = `<p class="text-center text-gray-500 p-6 bg-white rounded-lg shadow">No lawyers found matching your criteria. Try a different location or specialty.</p>`;
            return;
        }

        const cardsHTML = lawyers.map(lawyer => `
            <div class="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500 flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">${lawyer.full_name}</h3>
                    <p class="text-blue-600 font-medium">${lawyer.practice_area} (${lawyer.experience} Yrs Exp.)</p>
                    <p class="text-gray-500 text-sm">${lawyer.city}, ${lawyer.state}</p>
                </div>
                <div class="text-right">
                    <!-- Placeholder for Contact Button functionality -->
                    <button class="mt-2 bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600">
                        View Profile
                    </button>
                </div>
            </div>
        `).join('');

        matchesContainer.innerHTML = cardsHTML;
    };


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        matchesContainer.innerHTML = '<p class="text-center text-gray-500 p-6 bg-white rounded-lg shadow">Searching for the best lawyers...</p>';

        // 1. Collect Client Search Data
        const clientQuery = {
            caseType: document.getElementById('clientCaseType').value,
            location: encodeURIComponent(document.getElementById('clientLocation').value.toLowerCase().trim()),
        };
        
        const apiUrl = `/api/lawyer/search?caseType=${clientQuery.caseType}&location=${clientQuery.location}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    // CRUCIAL: Attach the JWT token to the Authorization header
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await response.json();

            if (response.ok && data.lawyers) {
                renderMatches(data.lawyers);
            } else if (response.status === 401 || response.status === 403) {
                // Token invalid or user not authorized (Client only route)
                localStorage.removeItem('nyay_setu_token');
                matchesContainer.innerHTML = `<p class="text-center text-red-500 p-6 bg-white rounded-lg shadow">Session invalid. Please log in again.</p>`;
                setTimeout(() => { window.location.href = 'auth.html'; }, 1500);
            }
            else {
                // Error or No Matches
                matchesContainer.innerHTML = `
                    <p class="text-center text-red-500 p-6 bg-white rounded-lg shadow">
                        ${data.message || "No lawyers found matching your criteria."}
                    </p>`;
            }
        } catch (error) {
            console.error('Fetch error during client search:', error);
            matchesContainer.innerHTML = `
                <p class="text-center text-red-700 p-6 bg-white rounded-lg shadow">
                    Could not connect to the matching service.
                </p>`;
        }
    });
});
