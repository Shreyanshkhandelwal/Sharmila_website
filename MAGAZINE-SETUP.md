# MochaInk membership implementation

The homepage magazine section and newsletter page now open an accessible membership dialog with the requested copy, email field, monthly and annual offers. Email signup is sent to ADMIN_EMAIL (or SMTP_EMAIL) using existing SMTP credentials. It does not grant reading access or claim payment success. No real email or payment was sent during testing.

Configure SMTP_EMAIL, SMTP_PASSWORD and optionally ADMIN_EMAIL in the hosting environment. Configure MAGAZINE_MONTHLY_PAYMENT_LINK and MAGAZINE_YEARLY_PAYMENT_LINK with separate Razorpay checkout links for ₹120/month and ₹1,500/year. Unconfigured links are hidden with an availability notice. Recurring billing and tote fulfilment must be configured in the payment/business system.

## Remaining requirements before ticket closure

- Supply the actual magazine article project: this folder contains promotional pages and article summaries, not full magazine articles.
- Confirm whether email signup alone grants access or paid membership is mandatory.
- Implement the ten-line preview on those article pages. Serve full content only after server-side access checks; CSS truncation and local storage flags are not a secure paywall.
- For paid access, verify Razorpay payments server-side and persist membership expiry against verified reader identities. A payment redirect alone must never unlock content.
- Supply the ticket identifier and tracker access. No ticket was closed and nothing was deployed.

## Verification

- `node --test magazine.test.js`: passes; validates bad input, unsupported methods, missing email configuration, payment-host validation, mocked signup success, and mail failure.
- JavaScript syntax checks pass.
- Browser checked the popup layout, labels and unavailable-payment state at localhost.
- Google Drive publicly displays the 24-page Legend Playbook with a Download control, without sign-in. Actual download transfer and production email delivery have not been tested.
- Replaced the ebook page's misleading PNG-as-PDF download with a full-PDF email request link (the sample-reader link remains available). Fixed the homepage playbook form's false success message on network failure.

Review outcome: the popup is a prepared component, not a completed paywall. Ticket closure is blocked on the items above. This downloaded folder has no Git metadata, so changes are saved locally without a commit.
