// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.getElementById('getStartedBtn');
    const modal = document.getElementById('roleSelectionModal');
    const closeBtn = document.querySelector('.modal .close-btn');

    // Function to open the modal
    getStartedBtn.addEventListener('click', () => {
        modal.classList.add('open');
        modal.style.display = 'flex'; // Use flex to center it
    });

    // Function to close the modal (by button or clicking outside)
    const closeModal = () => {
        modal.classList.remove('open');
        modal.style.display = 'none';
    };

    closeBtn.addEventListener('click', closeModal);

    // Close if user clicks outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});