/* Contact page: form submit to Google Apps Script + nav + WhatsApp float */
(function () {
    'use strict';

    var GAS_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
    var RETURN_URL_KEY = 'divineway_returnUrl';
    var RETURN_HASH_KEY = 'divineway_returnHash';

    function redirectToThankYou(returnUrl, returnHash) {
        try {
            sessionStorage.setItem(RETURN_URL_KEY, returnUrl || 'contact.html');
            sessionStorage.setItem(RETURN_HASH_KEY, returnHash || '');
        } catch (e) {}
        window.location.href = 'thank-you.html';
    }
    function showErrorModal() {
        var errModal = document.getElementById('error-modal');
        if (errModal) {
            errModal.classList.add('is-open');
            errModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }
    function closeErrorModal() {
        var errModal = document.getElementById('error-modal');
        if (errModal) {
            errModal.classList.remove('is-open');
            errModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }
    function isValidEmail(str) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((str || '').trim());
    }
    function clearFieldError(inputId) {
        var el = document.getElementById(inputId);
        if (el) { el.classList.remove('input-invalid'); el.removeAttribute('aria-invalid'); }
        var err = document.getElementById(inputId + '-error');
        if (err) err.textContent = '';
    }
    function setFieldError(inputId, message) {
        var el = document.getElementById(inputId);
        if (el) { el.classList.add('input-invalid'); el.setAttribute('aria-invalid', 'true'); }
        var err = document.getElementById(inputId + '-error');
        if (err) err.textContent = message;
    }
    function clearFormErrors(formErrorsId, fieldIds) {
        var summary = document.getElementById(formErrorsId);
        if (summary) { summary.hidden = true; summary.innerHTML = ''; }
        (fieldIds || []).forEach(clearFieldError);
    }

    (function initWhatsAppFloat() {
        var el = document.getElementById('whatsapp-float');
        if (!el) return;
        var phone = (el.getAttribute('data-phone') || '').replace(/\D/g, '');
        if (!phone) return;
        var isPhoneOrTablet = window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches;
        el.href = isPhoneOrTablet ? 'https://wa.me/' + phone : 'https://web.whatsapp.com/send?phone=' + phone;
    })();

    var contactFieldIds = ['contact-name', 'contact-email', 'contact-message'];
    var errorModal = document.getElementById('error-modal');
    var errorModalBackdrop = document.getElementById('error-modal-backdrop');
    var errorModalClose = document.getElementById('error-modal-close');
    var errorModalOk = document.getElementById('error-modal-ok');
    if (errorModalBackdrop) errorModalBackdrop.addEventListener('click', closeErrorModal);
    if (errorModalClose) errorModalClose.addEventListener('click', closeErrorModal);
    if (errorModalOk) errorModalOk.addEventListener('click', closeErrorModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && errorModal && errorModal.classList.contains('is-open')) closeErrorModal();
    });

    var form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var nameEl = document.getElementById('contact-name');
            var emailEl = document.getElementById('contact-email');
            var messageEl = document.getElementById('contact-message');
            var name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
            var email = (emailEl && emailEl.value) ? emailEl.value.trim() : '';
            var message = (messageEl && messageEl.value) ? messageEl.value.trim() : '';
            var formErrorsEl = document.getElementById('contact-form-errors');
            clearFormErrors('contact-form-errors', contactFieldIds);

            var hasError = false;
            if (!name) { setFieldError('contact-name', 'Please enter your name.'); hasError = true; }
            if (!email) { setFieldError('contact-email', 'Please enter your email address.'); hasError = true; }
            else if (!isValidEmail(email)) { setFieldError('contact-email', 'Please enter a valid email address.'); hasError = true; }
            if (!message) { setFieldError('contact-message', 'Please enter your message.'); hasError = true; }

            if (hasError && formErrorsEl) {
                formErrorsEl.hidden = false;
                formErrorsEl.innerHTML = '<ul><li>Please correct the errors below and try again.</li></ul>';
                return;
            }

            var btn = form.querySelector('.contact-submit');
            if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
            if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.indexOf('YOUR_') === 0) {
                if (btn) { btn.disabled = false; btn.textContent = 'Send message'; }
                showErrorModal();
                return;
            }
            var payload = {
                formType: 'contact',
                name: name,
                email: email,
                message: message
            };
            fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function () {
                    if (btn) { btn.disabled = false; btn.textContent = 'Send message'; }
                    form.reset();
                    redirectToThankYou('contact.html', '');
                })
                .catch(function () {
                    if (btn) { btn.disabled = false; btn.textContent = 'Send message'; }
                    showErrorModal();
                });
        });
    }

    /* Lucide icons (logo moon + More chevron) — same as home page */
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

    /* Nav: dropdown and mobile */
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    var navDropdownWrap = document.querySelector('.nav-dropdown-wrap');
    var navDropdownTrigger = document.getElementById('nav-dropdown-trigger');
    function closeNav() {
        if (navLinks && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open menu');
            }
            document.body.style.overflow = '';
        }
        if (navDropdownWrap) navDropdownWrap.classList.remove('open');
        if (navDropdownTrigger) navDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var open = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open);
            navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            document.body.style.overflow = open ? 'hidden' : '';
        });
        navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    }
    if (navDropdownTrigger && navDropdownWrap) {
        navDropdownTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var open = navDropdownWrap.classList.toggle('open');
            navDropdownTrigger.setAttribute('aria-expanded', open);
        });
        document.addEventListener('click', function (e) {
            if (!navDropdownWrap.contains(e.target)) {
                navDropdownWrap.classList.remove('open');
                navDropdownTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* Header: keep same look as home page (always use “scrolled” style so navbar is identical) */
    var header = document.querySelector('.header');
    if (header) header.classList.add('scrolled');

    /* Scroll reveal */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });
    document.querySelectorAll('.fade').forEach(function (el) { observer.observe(el); });
})();
