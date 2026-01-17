/**
 * AfroRhythm Admin Enhanced UI JavaScript
 * Implements animations and UI improvements for the admin dashboard
 */

// Override or extend placeholders in admin.js
function animateStats() {
    console.log('🚀 Animating stats cards...');
    const statsCards = document.querySelectorAll('.stats-card');

    statsCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });

    // Animate numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseFloat(stat.innerText.replace(/,/g, '').replace('$', ''));
        if (isNaN(target)) return;

        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const updateCount = () => {
            current += increment;
            if (current < target) {
                stat.innerText = Math.floor(current).toLocaleString() + (stat.innerText.includes('$') ? '$' : '');
                requestAnimationFrame(updateCount);
            } else {
                stat.innerText = target.toLocaleString() + (stat.innerText.includes('$') ? '$' : '');
            }
        };

        updateCount();
    });
}

function addRefreshButton() {
    console.log('🔄 Adding refresh button...');
    const topBar = document.querySelector('.top-bar .d-flex');
    if (!topBar) return;

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn btn-outline-light btn-sm ms-3';
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
    refreshBtn.id = 'dashboardRefreshBtn';

    // Add before the profile dropdown
    const profileDropdown = topBar.querySelector('.dropdown');
    if (profileDropdown) {
        topBar.insertBefore(refreshBtn, profileDropdown);
    } else {
        topBar.appendChild(refreshBtn);
    }

    refreshBtn.addEventListener('click', async function () {
        this.querySelector('i').classList.add('fa-spin');
        this.disabled = true;

        try {
            await loadSampleData(); // Function from admin.js
            showToast('Dashboard data refreshed successfully!');
            animateStats();
        } catch (error) {
            showToast('Failed to refresh data', 'danger');
        } finally {
            this.querySelector('i').classList.remove('fa-spin');
            this.disabled = false;
        }
    });
}

function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * Saves the admin profile from the modal
 * This is a simulated save for the demo
 */
function saveAdminProfile() {
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;

    console.log('👤 Saving admin profile:', { name, email });

    // Simulate API call
    showToast('Profile updated successfully!');

    // Update display name if it exists in the UI
    const adminDisplayName = document.querySelector('.admin-info span');
    if (adminDisplayName) {
        adminDisplayName.textContent = name;
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('adminProfileModal'));
    if (modal) modal.hide();
}

// Initialize when navigation is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for admin.js to finish its basic setup
    setTimeout(() => {
        animateStats();
        addRefreshButton();
    }, 500);
});
