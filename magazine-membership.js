(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'magazine-dialog';
  dialog.setAttribute('aria-labelledby', 'magazine-title');
  dialog.innerHTML = `
    <button type="button" class="magazine-close" aria-label="Close membership popup">×</button>
    <p class="magazine-kicker">MochaInk Magazine</p>
    <h2 id="magazine-title">Enjoying this article?</h2>
    <p>To continue reading, please enter your email or subscribe to MochaInk Magazine.</p>
    <form class="magazine-form">
      <label for="magazine-email">Your email address</label>
      <input id="magazine-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" maxlength="254" required>
      <button type="submit">Submit email →</button>
      <small>Receive updates about MochaInk Magazine membership.</small>
    </form>
    <p class="magazine-status" role="status" aria-live="polite"></p>
    <div class="magazine-plans">
      <div><strong>₹120/month</strong><span>12 essays per month</span><a data-plan="monthly" hidden>Subscribe monthly →</a></div>
      <div><strong>₹1,500/year</strong><span>+ FREE tote bag worth ₹750</span><a data-plan="yearly" hidden>Subscribe yearly →</a></div>
    </div>
    <p class="magazine-payment-status" role="status">Loading membership options…</p>
    <p class="magazine-footer">Unlock full access and discover more stories.</p>`;
  document.body.append(dialog);
  const status = dialog.querySelector('.magazine-status');
  const form = dialog.querySelector('form');
  let opener;
  dialog.querySelector('.magazine-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  document.querySelectorAll('[data-magazine-membership]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      dialog.showModal();
    });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = 'Submitting…';
    status.textContent = '';
    try {
      const response = await fetch('/api/magazine', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.elements.email.value.trim() }),
      });
      const data = await response.json().catch(() => {
        throw new Error('Email signup is temporarily unavailable. Please try again later.');
      });
      if (!response.ok) throw new Error(data.error || 'Signup failed. Please try again.');
      status.textContent = data.message;
      form.reset();
    } catch (error) {
      status.textContent = error instanceof TypeError
        ? 'Unable to connect. Please check your connection and try again.'
        : error.message || 'Signup failed. Please try again.';
    } finally {
      button.disabled = false;
      button.textContent = 'Submit email →';
    }
  });
  fetch('/api/magazine').then(response => {
    if (!response.ok) throw new Error('Membership options unavailable');
    return response.json();
  }).then(plans => {
    for (const plan of ['monthly', 'yearly']) {
      if (!plans[plan]) continue;
      const link = dialog.querySelector(`[data-plan="${plan}"]`);
      link.href = plans[plan];
      link.hidden = false;
    }
    dialog.querySelector('.magazine-payment-status').textContent = plans.monthly && plans.yearly
      ? 'Secure payment with Razorpay.' : 'Some membership payment options are not yet available. Leave your email for updates.';
  }).catch(() => {
    dialog.querySelector('.magazine-payment-status').textContent = 'Membership payments are temporarily unavailable. Please try again later.';
  });
})();
