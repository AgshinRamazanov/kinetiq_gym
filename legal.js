(() => {
  const effective = 'July 12, 2026';
  document.querySelector('main').insertAdjacentHTML('beforeend', `
    <footer class="legal-footer"><button data-legal="privacy">Privacy</button><button data-legal="terms">Terms</button><button data-legal="health">Health disclaimer</button></footer>
    <div class="sheet" id="privacy" aria-hidden="true"><div class="sheet-content compact-sheet legal-sheet"><button class="close" data-close aria-label="Close privacy policy">×</button><p class="eyebrow">LEGAL</p><h2>Privacy Policy</h2><p>Effective ${effective}</p><h3>Data we process</h3><p>Account details, fitness preferences, workouts, meals, progress, and technical diagnostics needed to operate and secure KINETIQ. Food photos are sent for analysis and are not stored by KINETIQ after the request completes.</p><h3>How we use it</h3><p>To synchronize data, personalize estimates, prevent abuse, understand anonymous feature usage, and diagnose errors. We do not sell personal data.</p><h3>Your choices</h3><p>You can use local-only features or permanently delete your account and synchronized data from the account screen.</p></div></div>
    <div class="sheet" id="terms" aria-hidden="true"><div class="sheet-content compact-sheet legal-sheet"><button class="close" data-close aria-label="Close terms">×</button><p class="eyebrow">LEGAL</p><h2>Terms of Use</h2><p>Effective ${effective}</p><p>You must be at least 18. Use the app lawfully and keep credentials secure. Fitness, calorie, body-composition, and image-based nutrition results are estimates. Accounts used for abuse may be limited or suspended.</p></div></div>
    <div class="sheet" id="health" aria-hidden="true"><div class="sheet-content compact-sheet legal-sheet"><button class="close" data-close aria-label="Close health disclaimer">×</button><p class="eyebrow">SAFETY</p><h2>Health disclaimer</h2><p>KINETIQ provides general educational fitness and nutrition estimates, not diagnosis, treatment, or medical advice. Consult a qualified healthcare professional before changing exercise or diet, especially if pregnant, injured, under medical care, or living with a health condition. For emergencies, contact local emergency services.</p></div></div>`);

  document.querySelectorAll('[data-legal]').forEach(button => button.addEventListener('click', () => window.Kinetiq.ui.openSheet(button.dataset.legal)));
  document.querySelectorAll('.legal-sheet').forEach(sheet => sheet.closest('.sheet').setAttribute('inert', ''));
  document.querySelectorAll('.legal-sheet [data-close]').forEach(button => button.addEventListener('click', () => window.Kinetiq.ui.closeSheet(button.closest('.sheet'))));

  const create = document.querySelector('[data-action="create-account"]');
  const consent = document.createElement('label');
  consent.className = 'consent-row'; consent.id = 'signup-consent'; consent.hidden = true;
  consent.innerHTML = '<input id="legal-consent" type="checkbox"><span>I agree to the Terms and Privacy Policy and understand that KINETIQ is not medical advice.</span>';
  create?.before(consent);
  window.setLegalSignupMode = signup => { consent.hidden = !signup; consent.querySelector('input').required = signup; };
  create?.addEventListener('click', () => window.setLegalSignupMode(consent.hidden));
})();
