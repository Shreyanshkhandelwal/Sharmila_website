/* ==========================================================================
   Discovery Call Booking Modal
   Injects the modal markup once, wires the sticky CTA button to open it,
   and on submit stashes the form data locally then redirects to your
   Razorpay Payment Link. Emails only send from payment-successful.html,
   after Razorpay confirms the payment actually happened.
   ========================================================================== */

(function () {
  function injectModal() {
    var overlay = document.createElement('div');
    overlay.className = 'discovery-overlay';
    overlay.id = 'discovery-overlay';
    overlay.innerHTML =
      '<div class="discovery-modal" role="dialog" aria-modal="true" aria-labelledby="discovery-modal-title">' +
        '<button type="button" class="discovery-modal__close" id="discovery-modal-close" aria-label="Close">&times;</button>' +
        '<p class="discovery-modal__kicker" id="discovery-modal-title">Book a 30-Minute Discovery Call</p>' +
        '<p class="discovery-modal__price">Brand Storytelling Solutions &middot; Rs. 1,999</p>' +
        '<form id="discovery-form">' +
          '<div class="discovery-field">' +
            '<label for="discovery-name">Name</label>' +
            '<input type="text" id="discovery-name" name="name" required>' +
          '</div>' +
          '<div class="discovery-field">' +
            '<label for="discovery-phone">Phone Number</label>' +
            '<input type="tel" id="discovery-phone" name="phone" required>' +
          '</div>' +
          '<div class="discovery-field">' +
            '<label for="discovery-email">Email</label>' +
            '<input type="email" id="discovery-email" name="email" required>' +
          '</div>' +
          '<div class="discovery-field">' +
            '<label for="discovery-requirement">Your Requirement (1-2 lines)</label>' +
            '<textarea id="discovery-requirement" name="requirement" required></textarea>' +
          '</div>' +
          '<button type="submit" class="discovery-submit" id="discovery-submit-btn">Proceed to Payment</button>' +
          '<p class="discovery-error" id="discovery-error"></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function openModal(overlay) {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var overlay = injectModal();
    var closeBtn = document.getElementById('discovery-modal-close');
    var form = document.getElementById('discovery-form');
    var submitBtn = document.getElementById('discovery-submit-btn');
    var errorEl = document.getElementById('discovery-error');

    // Wire every sticky CTA on the page to open the modal
    document.querySelectorAll('.mocha-sticky-cta').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(overlay);
      });
    });

    closeBtn.addEventListener('click', function () { closeModal(overlay); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(overlay);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.classList.remove('is-visible');
      errorEl.textContent = '';

      var payload = {
        name: document.getElementById('discovery-name').value.trim(),
        phone: document.getElementById('discovery-phone').value.trim(),
        email: document.getElementById('discovery-email').value.trim(),
        requirement: document.getElementById('discovery-requirement').value.trim()
      };

      if (!payload.name || !payload.phone || !payload.email || !payload.requirement) {
        errorEl.textContent = 'Please fill in every field.';
        errorEl.classList.add('is-visible');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Redirecting to payment...';

      // Stash the form data locally (NOT sent to the server / no email yet).
      // payment-successful.html reads this back and only THEN sends the
      // booking emails, once Razorpay confirms the payment via redirect.
      sessionStorage.setItem('mocha_discovery_booking', JSON.stringify(payload));

      // ⚠️ Replace with your Razorpay Payment Link created via
      // Dashboard → Payment Links → Create (fixed amount ₹1,999, with
      // "Enable Redirect" turned on, pointing to your live
      // payment-successful.html URL). The razorpay.me personal link does
      // NOT support this redirect, so it can't be used here.
      var RAZORPAY_PAYMENT_LINK = 'https://razorpay.com/payment-link/REPLACE_ME';

      window.location.href = RAZORPAY_PAYMENT_LINK;
    });
  });
})();
