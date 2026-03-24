// =============================================================
// MTN MoMo Simulation Engine — AfroRythm Platform
// =============================================================

/**
 * Called by "Withdraw via MTN MoMo" button on the Revenue page.
 * Reads the chosen amount from the inline input and opens the MoMo withdrawal modal.
 */
window.handleWithdrawClick = function () {
    const amountInput = document.getElementById('withdrawAmount');
    const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    // Pass available balance from mockData if accessible
    const available = (window.mockData && window.mockData.stats && window.mockData.stats.availableForWithdrawal)
        ? parseFloat(String(window.mockData.stats.availableForWithdrawal).replace(/[^0-9.]/g, '')) || 9999
        : 9999;
    // Pre-fill the amount in the MoMo modal
    window.openMomoWithdrawModal(available);
    // After modal opens, pre-set the amount
    setTimeout(() => {
        const momoAmountInput = document.getElementById('momoWithdrawAmount');
        if (momoAmountInput && amount > 0) {
            momoAmountInput.value = amount;
            momoAmountInput.dispatchEvent(new Event('input'));
        }
    }, 300);
};


/**
 * Open the MoMo subscription modal and populate with plan details.
 */
window.openMomoSubscribeModal = function (planName, priceAmount) {
    document.getElementById('momoSubInputSection').style.display = 'block';
    document.getElementById('momoSubProcessing').style.display = 'none';
    document.getElementById('momoSubSuccess').style.display = 'none';
    document.getElementById('momoSubFooter').style.display = 'block';
    document.getElementById('momoSubPhone').value = '';

    document.getElementById('momoSubAmount').textContent =
        priceAmount === 0 ? 'FREE' : Number(priceAmount).toLocaleString() + ' FCFA/mo';
    document.getElementById('momoSubPlanName').textContent = planName + ' Plan';

    window._momoPlan = { name: planName, price: priceAmount };

    bootstrap.Modal.getOrCreateInstance(document.getElementById('momoSubscribeModal')).show();
};

/**
 * Open the MoMo withdrawal modal.
 */
window.openMomoWithdrawModal = function (availableAmount) {
    document.getElementById('momoWithdrawInputSection').style.display = 'block';
    document.getElementById('momoWithdrawProcessing').style.display = 'none';
    document.getElementById('momoWithdrawSuccess').style.display = 'none';
    document.getElementById('momoWithdrawFooter').style.display = 'block';
    document.getElementById('momoWithdrawPhone').value = '';
    document.getElementById('momoWithdrawAmount').value = '';
    document.getElementById('momoFeeBase').textContent = '0 FCFA';
    document.getElementById('momoFeeCharge').textContent = '— FCFA';
    document.getElementById('momoFeeNet').textContent = '0 FCFA';

    window._momoAvailable = availableAmount || 0;

    const amountInput = document.getElementById('momoWithdrawAmount');
    amountInput.max = Math.min(10000, availableAmount);
    amountInput.oninput = function () {
        const val = parseFloat(this.value) || 0;
        const fee = Math.round(val * 0.02);
        const net = val - fee;
        document.getElementById('momoFeeBase').textContent = val.toLocaleString() + ' FCFA';
        document.getElementById('momoFeeCharge').textContent = '- ' + fee.toLocaleString() + ' FCFA';
        document.getElementById('momoFeeNet').textContent = (net > 0 ? net : 0).toLocaleString() + ' FCFA';
    };

    bootstrap.Modal.getOrCreateInstance(document.getElementById('momoWithdrawModal')).show();
};

/**
 * Open the MoMo update account modal.
 */
window.openMomoUpdateAccountModal = function () {
    document.getElementById('momoUpdateInputSection').style.display = 'block';
    document.getElementById('momoUpdateProcessing').style.display = 'none';
    document.getElementById('momoUpdateSuccess').style.display = 'none';
    document.getElementById('momoUpdateFooter').style.display = 'block';
    document.getElementById('momoUpdatePhone').value = '';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('momoUpdateAccountModal')).show();
};
window.openUpdatePaymentFromModal = window.openMomoUpdateAccountModal;

/**
 * Subscription payment simulation flow.
 */
window.initiateMomoSubscription = function () {
    const phone = document.getElementById('momoSubPhone').value.trim();
    const plan = window._momoPlan || {};

    if (!phone || phone.length < 9 || !phone.startsWith('6')) {
        const input = document.getElementById('momoSubPhone');
        input.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.4)';
        input.placeholder = 'Invalid number! Use format 6XXXXXXXX';
        setTimeout(() => { input.style.boxShadow = ''; input.placeholder = '6XX XXX XXX'; }, 2000);
        return;
    }

    const formatted = `+237 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    document.getElementById('momoSubInputSection').style.display = 'none';
    document.getElementById('momoSubFooter').style.display = 'none';
    document.getElementById('momoSubProcessing').style.display = 'block';

    const steps = [
        { title: 'Sending payment prompt...', msg: `A MoMo request has been sent to ${formatted}.` },
        { title: 'Waiting for PIN confirmation...', msg: 'Please enter your MoMo PIN on your phone when prompted.' },
        { title: 'Verifying with MTN network...', msg: 'Confirming your payment. Please do not close this window.' },
        { title: 'Activating subscription...', msg: `Payment confirmed! Activating your ${plan.name} plan...` },
    ];

    runMomoSteps(
        steps,
        document.getElementById('momoSubStatusTitle'),
        document.getElementById('momoSubStatusMsg'),
        async () => {
            try {
                // Get current user ID
                const sessionRes = await fetch('backend/api/session.php');
                const session = await sessionRes.json();
                
                if (!session.success || !session.data.user) {
                    throw new Error("User session not found");
                }
                
                const userId = session.data.user.id;
                const startDate = new Date().toISOString().split('T')[0];
                const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
                
                // Create subscription record
                const subRes = await fetch('backend/api/subscriptions.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        plan_name: plan.name,
                        amount: plan.price,
                        status: 'active',
                        start_date: startDate,
                        end_date: endDate
                    })
                });
                
                const subJson = await subRes.json();
                if (!subJson.success) throw new Error(subJson.message);

                document.getElementById('momoSubProcessing').style.display = 'none';
                document.getElementById('momoSubSuccess').style.display = 'block';
                document.getElementById('momoSubSuccessMsg').textContent =
                    plan.price === 0
                        ? `Your ${plan.name} plan is now active. Enjoy AfroRythm for free!`
                        : `${Number(plan.price).toLocaleString()} FCFA was charged to ${formatted}. Your ${plan.name} plan is active.`;
                
                if (typeof showNotification === 'function')
                    showNotification(`${plan.name} plan activated via MoMo! 🎉`, 'success');

                // Reload page after a short delay to reflect changes
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (err) {
                console.error("Subscription Error:", err);
                if (typeof showNotification === 'function')
                    showNotification('Subscription failed: ' + err.message, 'danger');
                document.getElementById('momoSubProcessing').style.display = 'none';
                document.getElementById('momoSubInputSection').style.display = 'block';
                document.getElementById('momoSubFooter').style.display = 'block';
            }
        }
    );
};

/**
 * Withdrawal simulation flow.
 */
window.initiateMomoWithdrawal = function () {
    const phone = document.getElementById('momoWithdrawPhone').value.trim();
    const amount = parseFloat(document.getElementById('momoWithdrawAmount').value);
    const available = window._momoAvailable || 0;

    if (!phone || phone.length < 9 || !phone.startsWith('6')) {
        const input = document.getElementById('momoWithdrawPhone');
        input.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.4)';
        setTimeout(() => input.style.boxShadow = '', 2000);
        return;
    }

    if (!amount || amount < 5000) {
        const input = document.getElementById('momoWithdrawAmount');
        input.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.4)';
        if (typeof showNotification === 'function')
            showNotification('Minimum withdrawal is 5,000 FCFA', 'danger');
        setTimeout(() => input.style.boxShadow = '', 2000);
        return;
    }

    if (amount > Math.min(10000, available)) {
        if (typeof showNotification === 'function')
            showNotification('Amount exceeds daily limit (10,000 FCFA) or available balance.', 'danger');
        return;
    }

    const formatted = `+237 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    const fee = Math.round(amount * 0.02);
    const net = amount - fee;

    document.getElementById('momoWithdrawInputSection').style.display = 'none';
    document.getElementById('momoWithdrawFooter').style.display = 'none';
    document.getElementById('momoWithdrawProcessing').style.display = 'block';

    const steps = [
        { title: 'Initiating transfer...', msg: 'Connecting to MTN MoMo network...' },
        { title: 'Processing payment...', msg: `Transferring ${net.toLocaleString()} FCFA to ${formatted}...` },
        { title: 'Waiting for MTN confirmation...', msg: 'Network verification in progress. This may take a moment.' },
        { title: 'Transfer complete!', msg: 'Updating your earnings balance...' },
    ];

    runMomoSteps(
        steps,
        document.getElementById('momoWithdrawStatusTitle'),
        document.getElementById('momoWithdrawStatusMsg'),
        () => {
            document.getElementById('momoWithdrawProcessing').style.display = 'none';
            document.getElementById('momoWithdrawSuccess').style.display = 'block';
            document.getElementById('momoWithdrawSuccessMsg').textContent =
                `${net.toLocaleString()} FCFA sent to ${formatted}. Processing fee: ${fee.toLocaleString()} FCFA.`;
            if (typeof showNotification === 'function')
                showNotification(`${net.toLocaleString()} FCFA transferred to MoMo! 💸`, 'success');
        }
    );
};

/**
 * Update MoMo account simulation flow.
 */
window.initiateMomoUpdate = function () {
    const phone = document.getElementById('momoUpdatePhone').value.trim();

    if (!phone || phone.length < 9 || !phone.startsWith('6')) {
        const input = document.getElementById('momoUpdatePhone');
        input.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.4)';
        setTimeout(() => input.style.boxShadow = '', 2000);
        return;
    }

    const formatted = `+237 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    document.getElementById('momoUpdateInputSection').style.display = 'none';
    document.getElementById('momoUpdateFooter').style.display = 'none';
    document.getElementById('momoUpdateProcessing').style.display = 'block';

    // Simulate update delay
    setTimeout(() => {
        document.getElementById('momoUpdateProcessing').style.display = 'none';
        document.getElementById('momoUpdateSuccess').style.display = 'block';
        document.getElementById('momoUpdateSuccessMsg').textContent = 
            `Your payment account has been updated to ${formatted}. Future transactions will use this number.`;
        
        // Update UI displays
        const displays = ['momoNumberDisplay', 'momoNumberManageDisplay'];
        displays.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = `MTN MoMo: ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
        });

        if (typeof showNotification === 'function')
            showNotification('MoMo account updated successfully! 🎉', 'success');
    }, 2500);
};

/**
 * Utility: cycle through MoMo steps then call onDone.
 */
function runMomoSteps(steps, titleEl, msgEl, onDone) {
    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            titleEl.textContent = steps[i].title;
            msgEl.textContent = steps[i].msg;
            i++;
        } else {
            clearInterval(interval);
            onDone();
        }
    }, 1400);
}

/**
 * Close & reset a MoMo modal.
 */
window.closeMomoModal = function (modalId) {
    const modalEl = document.getElementById(modalId);
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();

    modalEl.addEventListener('hidden.bs.modal', function resetOnClose() {
        if (modalId === 'momoSubscribeModal') {
            document.getElementById('momoSubProcessing').style.display = 'none';
            document.getElementById('momoSubSuccess').style.display = 'none';
            document.getElementById('momoSubFooter').style.display = 'block';
        } else if (modalId === 'momoUpdateAccountModal') {
            document.getElementById('momoUpdateInputSection').style.display = 'block';
            document.getElementById('momoUpdateProcessing').style.display = 'none';
            document.getElementById('momoUpdateSuccess').style.display = 'none';
            document.getElementById('momoUpdateFooter').style.display = 'block';
        } else {
            document.getElementById('momoWithdrawInputSection').style.display = 'block';
            document.getElementById('momoWithdrawProcessing').style.display = 'none';
            document.getElementById('momoWithdrawSuccess').style.display = 'none';
            document.getElementById('momoWithdrawFooter').style.display = 'block';
        }
        modalEl.removeEventListener('hidden.bs.modal', resetOnClose);
    });
};
