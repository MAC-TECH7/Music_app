// Js/admin-plans.js

document.addEventListener('DOMContentLoaded', function () {
    // Event listeners
    document.getElementById('managePlansBtn')?.addEventListener('click', openManagePlansModal);
    document.getElementById('addNewPlanBtn')?.addEventListener('click', openAddPlanModal);
});

// Open the Manage Plans Modal and fetch data
function openManagePlansModal() {
    loadPlans();
    const modal = new bootstrap.Modal(document.getElementById('managePlansModal'));
    modal.show();
}

// Fetch plans from API
async function loadPlans() {
    try {
        const response = await fetch('backend/api/plans.php');
        const data = await response.json();

        if (data.success) {
            populatePlansTable(data.data);
        } else {
            console.error('Failed to load plans:', data.message);
        }
    } catch (error) {
        console.error('Error loading plans:', error);
    }
}

// Populate the plans table
function populatePlansTable(plans) {
    const tbody = document.getElementById('plansTableBody');
    tbody.innerHTML = '';

    plans.forEach(plan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${plan.name}</strong></td>
            <td>${plan.price} ${plan.currency}</td>
            <td>${plan.period}</td>
            <td>${plan.description.substring(0, 30)}...</td>
            <td>${plan.is_popular ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
            <td>
                <button class="btn btn-sm btn-outline-info me-1" onclick="editPlan(${plan.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePlan(${plan.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Open modal for adding a new plan
function openAddPlanModal() {
    // Reset form
    document.getElementById('planForm').reset();
    document.getElementById('planId').value = '';
    document.getElementById('addEditPlanModalLabel').innerHTML = '<i class="fas fa-plus me-2"></i>Add New Plan';

    // Switch modals
    bootstrap.Modal.getInstance(document.getElementById('managePlansModal')).hide();
    const modal = new bootstrap.Modal(document.getElementById('addEditPlanModal'));
    modal.show();
}

// Open modal for editing a plan
async function editPlan(id) {
    try {
        const response = await fetch('backend/api/plans.php'); // In a real app we might fetch just one
        const data = await response.json();
        const plan = data.data.find(p => p.id == id);

        if (plan) {
            document.getElementById('planId').value = plan.id;
            document.getElementById('formPlanName').value = plan.name;
            document.getElementById('formPlanPrice').value = plan.price;
            document.getElementById('formPlanCurrency').value = plan.currency;
            document.getElementById('formPlanPeriod').value = plan.period;
            document.getElementById('formPlanDescription').value = plan.description;
            document.getElementById('formPlanButtonText').value = plan.button_text;
            document.getElementById('formPlanFeatures').value = plan.features.join('\n');
            document.getElementById('formPlanPopular').checked = plan.is_popular;

            document.getElementById('addEditPlanModalLabel').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Plan';

            bootstrap.Modal.getInstance(document.getElementById('managePlansModal')).hide();
            const modal = new bootstrap.Modal(document.getElementById('addEditPlanModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error fetching plan details:', error);
    }
}

// Save (Create or Update) Plan
async function savePlan() {
    const id = document.getElementById('planId').value;
    const name = document.getElementById('formPlanName').value;
    const price = document.getElementById('formPlanPrice').value;
    const currency = document.getElementById('formPlanCurrency').value;
    const period = document.getElementById('formPlanPeriod').value;
    const description = document.getElementById('formPlanDescription').value;
    const buttonText = document.getElementById('formPlanButtonText').value;
    const featuresText = document.getElementById('formPlanFeatures').value;
    const isPopular = document.getElementById('formPlanPopular').checked;

    // Convert features textarea to array
    const features = featuresText.split('\n').filter(line => line.trim() !== '');

    const method = id ? 'PUT' : 'POST';
    const body = {
        id: id,
        name: name,
        price: price,
        currency: currency,
        period: period,
        description: description,
        button_text: buttonText,
        features: features,
        is_popular: isPopular ? 1 : 0
    };

    try {
        const response = await fetch('backend/api/plans.php', {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.success) {
            alert('Plan saved successfully!');
            bootstrap.Modal.getInstance(document.getElementById('addEditPlanModal')).hide();
            openManagePlansModal(); // Re-open management list
        } else {
            alert('Error saving plan: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving plan:', error);
        alert('An error occurred while saving the plan.');
    }
}

// Delete Plan
async function deletePlan(id) {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;

    try {
        const response = await fetch(`backend/api/plans.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            loadPlans(); // Reload table
        } else {
            alert('Error deleting plan: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting plan:', error);
        alert('An error occurred while deleting the plan.');
    }
}
