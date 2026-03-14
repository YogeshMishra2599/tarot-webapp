/* Article page: load .md by slug, parse frontmatter, render with marked + WhatsApp float */
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

    function getSlug() {
        var params = new URLSearchParams(window.location.search);
        return params.get('slug') || '';
    }

    function parseFrontmatter(text) {
        var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (!match) return null;
        var meta = {};
        match[1].split('\n').forEach(function (line) {
            var m = line.match(/^(\w+):\s*(.*)$/);
            if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^['"]|['"]$/g, '');
        });
        return { meta: meta, body: match[2] };
    }

    function formatDate(dateStr) {
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    var slug = getSlug();
    var titleEl = document.getElementById('article-title');
    var dateEl = document.getElementById('article-date');
    var bodyEl = document.getElementById('article-body');

    if (!slug) {
        if (titleEl) titleEl.textContent = 'Article not found';
        if (bodyEl) bodyEl.innerHTML = '<p><a href="all-articles.html">View all articles</a></p>';
        return;
    }

    fetch('articles/' + slug + '.md')
        .then(function (r) {
            if (!r.ok) throw new Error('Not found');
            return r.text();
        })
        .then(function (text) {
            var parsed = parseFrontmatter(text);
            if (!parsed) {
                if (titleEl) titleEl.textContent = 'Invalid article';
                if (bodyEl) bodyEl.innerHTML = '<p><a href="all-articles.html">View all articles</a></p>';
                return;
            }
            var title = parsed.meta.title || 'Article';
            var date = parsed.meta.date || '';
            if (titleEl) titleEl.textContent = title;
            document.title = title + ' | DivineWay Tarot';
            if (dateEl) {
                dateEl.textContent = formatDate(date);
                dateEl.setAttribute('datetime', date);
            }
            if (bodyEl && typeof marked !== 'undefined') {
                bodyEl.innerHTML = marked.parse(parsed.body);
            } else if (bodyEl) {
                bodyEl.innerHTML = '<p>' + parsed.body.replace(/\n/g, '</p><p>') + '</p>';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        })
        .catch(function () {
            if (titleEl) titleEl.textContent = 'Article not found';
            if (bodyEl) bodyEl.innerHTML = '<p>This article could not be loaded. <a href="all-articles.html">View all articles</a></p>';
        });

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

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });
    document.querySelectorAll('.fade').forEach(function (el) { observer.observe(el); });
})();
