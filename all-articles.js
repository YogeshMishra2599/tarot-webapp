/* All articles page: load manifest and render cards + WhatsApp float */
(function () {
    'use strict';

    (function initWhatsAppFloat() {
        var el = document.getElementById('whatsapp-float');
        if (!el) return;
        var phone = (el.getAttribute('data-phone') || '').replace(/\D/g, '');
        if (!phone) return;
        var isPhoneOrTablet = window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches;
        el.href = isPhoneOrTablet ? 'https://wa.me/' + phone : 'https://web.whatsapp.com/send?phone=' + phone;
    })();

    function formatDate(dateStr) {
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    var grid = document.getElementById('articles-grid');
    if (!grid) return;

    fetch('articles/manifest.json')
        .then(function (r) { return r.json(); })
        .then(function (articles) {
            articles.forEach(function (a) {
                var card = document.createElement('a');
                card.href = 'article.html?slug=' + encodeURIComponent(a.slug);
                card.className = 'article-card';
                card.innerHTML =
                    '<div class="article-card-image" aria-hidden="true"><i data-lucide="book-open" style="width:48px;height:48px;"></i></div>' +
                    '<div class="article-card-body">' +
                    '<h2 class="article-card-title">' + escapeHtml(a.title) + '</h2>' +
                    '<time class="article-card-date" datetime="' + escapeHtml(a.date) + '">' + formatDate(a.date) + '</time>' +
                    '<p class="article-card-excerpt">' + escapeHtml(a.excerpt || '') + '</p>' +
                    '</div>';
                grid.appendChild(card);
            });
            if (typeof lucide !== 'undefined') lucide.createIcons();
        })
        .catch(function () {
            grid.innerHTML = '<p class="section-lead">Unable to load articles. Please try again later.</p>';
        });

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /* Nav: dropdown and mobile */
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    var navDropdownWrap = document.querySelector('.nav-dropdown-wrap');
    var navDropdownTrigger = document.getElementById('nav-dropdown-trigger');
    function closeNav() {
        if (navLinks && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }
        if (navDropdownWrap) navDropdownWrap.classList.remove('open');
        if (navDropdownTrigger) navDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
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

    /* Header scroll state */
    var header = document.querySelector('.header');
    if (header) {
        function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* Scroll reveal */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });
    document.querySelectorAll('.fade').forEach(function (el) { observer.observe(el); });
})();
