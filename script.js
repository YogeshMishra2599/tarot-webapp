/* ============================================
   DivineWay — Tarot Website Scripts
   ============================================ */

(function () {
    'use strict';

    /* ----- Google Apps Script Web App URL (replace with your deployed script URL) ----- */
    var GAS_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

    var RETURN_URL_KEY = 'divineway_returnUrl';
    var RETURN_HASH_KEY = 'divineway_returnHash';

    function redirectToThankYou(returnUrl, returnHash) {
        try {
            sessionStorage.setItem(RETURN_URL_KEY, returnUrl || 'index.html');
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

    /* ----- WhatsApp float: open app on phone/tablet, WhatsApp Web on desktop/smart TV ----- */
    (function initWhatsAppFloat() {
        var el = document.getElementById('whatsapp-float');
        if (!el) return;
        var phone = (el.getAttribute('data-phone') || '').replace(/\D/g, '');
        if (!phone) return;
        var isPhoneOrTablet = window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches;
        el.href = isPhoneOrTablet
            ? 'https://wa.me/' + phone
            : 'https://web.whatsapp.com/send?phone=' + phone;
    })();

    /* ----- Smooth scroll for anchor links ----- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            var target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* ----- Scroll reveal ----- */
    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        },
        { rootMargin: '0px 0px -50px 0px', threshold: 0.08 }
    );
    document.querySelectorAll('.fade').forEach(function (el) { observer.observe(el); });

    /* ----- Top questions chart (load from top-questions-asked.percentages.md) ----- */
    var chartData = {
        week: { love: 22, career: 18, finances: 14, health: 12, study: 8, decision: 12, education: 6, other: 8 },
        all: { love: 28, career: 20, finances: 12, health: 10, study: 7, decision: 11, education: 5, other: 7 }
    };
    var chartTabs = document.querySelectorAll('.chart-tab');
    var chartBars = document.querySelectorAll('.chart-bar');
    var chartValues = document.querySelectorAll('.chart-value');

    function setChartRange(range) {
        var data = chartData[range] || chartData.all;
        chartBars.forEach(function (bar) {
            var cat = bar.getAttribute('data-category');
            var pct = data[cat] || 0;
            bar.style.width = pct + '%';
        });
        chartValues.forEach(function (val) {
            var cat = val.getAttribute('data-value');
            var pct = data[cat] || 0;
            val.textContent = pct + '%';
        });
    }

    function parsePercentagesMd(text) {
        var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!match) return null;
        var week = {};
        var all = {};
        match[1].split('\n').forEach(function (line) {
            var trimmed = line.trim();
            if (!trimmed || trimmed.indexOf('#') === 0) return;
            var m = trimmed.match(/^(week_|all_)(\w+):\s*(\d+)/);
            if (m) {
                var num = parseInt(m[3], 10);
                if (m[1] === 'week_') week[m[2]] = num;
                else all[m[2]] = num;
            }
        });
        return { week: week, all: all };
    }

    function initChart() {
        chartTabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                chartTabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
                tab.classList.add('active');
                tab.setAttribute('aria-pressed', 'true');
                setChartRange(tab.getAttribute('data-range'));
            });
        });
        setChartRange('week');
    }

    if (chartBars.length) {
        fetch('top-questions-asked.percentages.md')
            .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
            .then(function (text) {
                var parsed = parsePercentagesMd(text);
                if (parsed && Object.keys(parsed.week).length) chartData.week = parsed.week;
                if (parsed && Object.keys(parsed.all).length) chartData.all = parsed.all;
                initChart();
            })
            .catch(function () {
                initChart();
            });
    }

    /* ----- Header scroll state ----- */
    var header = document.querySelector('.header');
    if (header) {
        function onScroll() {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ----- FAQ accordion ----- */
    document.querySelectorAll('.faq-question').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.faq-item');
            var answer = document.getElementById(btn.getAttribute('aria-controls'));
            var isOpen = item.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', isOpen);
            if (answer) {
                if (isOpen) answer.removeAttribute('hidden');
                else answer.setAttribute('hidden', '');
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });

    /* ----- Mobile nav toggle + ESC to close ----- */
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
        navLinks.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', closeNav);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNav();
        });
    }

    /* ----- Nav dropdown (More menu) ----- */
    if (navDropdownTrigger && navDropdownWrap) {
        navDropdownTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var open = navDropdownWrap.classList.toggle('open');
            navDropdownTrigger.setAttribute('aria-expanded', open);
        });
        document.addEventListener('click', function (e) {
            if (navDropdownWrap.contains(e.target)) return;
            navDropdownWrap.classList.remove('open');
            navDropdownTrigger.setAttribute('aria-expanded', 'false');
        });
    }

    /* ----- Custom cursor (desktop / laptop / smart TV). Star appears after first move so users see normal cursor first. ----- */
    var cursor = document.querySelector('.cursor');
    var cursorBaseTransform = 'translate(-50%, -50%)';
    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        var cursorActivated = false;
        var interactiveSelector = 'a, button, .nav-dropdown-trigger, [role="button"], input, select, textarea, .btn';
        document.addEventListener('mousemove', function (e) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            if (!cursorActivated) {
                cursorActivated = true;
                document.body.classList.add('cursor-sparkle-active');
            }
            if (e.target.closest(interactiveSelector)) {
                document.body.classList.add('cursor-over-interactive');
            } else {
                document.body.classList.remove('cursor-over-interactive');
            }
        }, { passive: true });
        document.querySelectorAll(interactiveSelector).forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                cursor.style.transform = cursorBaseTransform + ' scale(1.3)';
                cursor.classList.add('is-hover');
            });
            el.addEventListener('mouseleave', function () {
                cursor.style.transform = cursorBaseTransform + ' scale(1)';
                cursor.classList.remove('is-hover');
            });
        });
    }

    /* ----- Cosmic background — more stars, some sparkling ----- */
    var canvas = document.getElementById('cosmos');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        var stars = [];
        var twinklePhase = 0;

        function resize() {
            var w = window.innerWidth;
            var h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
            if (stars.length === 0) {
                for (var i = 0; i < 260; i++) {
                    var isSparkle = Math.random() < 0.25;
                    stars.push({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        r: isSparkle ? Math.random() * 1.4 + 0.5 : Math.random() * 1.2 + 0.3,
                        speed: Math.random() * 0.22 + 0.04,
                        layer: Math.floor(Math.random() * 3),
                        phase: Math.random() * Math.PI * 2,
                        sparkle: isSparkle,
                        sparkleSpeed: 2.5 + Math.random() * 2
                    });
                }
            }
        }

        function animate() {
            if (!ctx || !canvas.width) return requestAnimationFrame(animate);
            if (document.hidden) {
                requestAnimationFrame(animate);
                return;
            }
            var w = canvas.width;
            var h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            twinklePhase += 0.018;

            stars.forEach(function (star) {
                star.y += star.speed;
                if (star.y > h) star.y = 0;
                var opacity;
                if (star.sparkle) {
                    var sparkle = Math.sin(twinklePhase * star.sparkleSpeed + star.phase);
                    opacity = 0.25 + 0.5 * (sparkle * sparkle * sparkle * sparkle);
                } else {
                    opacity = 0.3 + 0.2 * Math.sin(twinklePhase + star.phase);
                }
                if (star.layer === 0) opacity *= 0.55;
                if (star.layer === 2) opacity *= 1.15;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(201, 169, 98, ' + Math.min(1, opacity) + ')';
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    /* ----- Om-style chanting: fade in + hold = 10s, then fade out, loop (no pause) ----- */
    var audioCtx = null;
    var ambientGain = null;
    var breathGain = null;
    var ambientPlaying = false;
    var soundToggle = document.getElementById('sound-toggle');
    var omCycleTimeout = null;
    var omBreathInterval = null;
    var omOsc1 = null;
    var omOsc2 = null;
    var omOsc3 = null;
    var omFilter = null;
    var OM_GAIN = 0.2;
    var OM_FADE_IN = 4;
    var OM_HOLD = 6;
    var OM_FADE_OUT = 5;
    var OM_CYCLE_TOTAL = OM_FADE_IN + OM_HOLD + OM_FADE_OUT;
    var OM_FILTER_LOW = 200;
    var OM_FILTER_MID = 420;
    var OM_BREATH_RATE = 0.08;
    var OM_BREATH_DEPTH = 0.07;
    var OM_BASE_FREQ = 136.1;
    var OM_VIBRATO_RATE = 4.2;
    var OM_VIBRATO_DEPTH = 0.45;
    var OM_DRIFT_RATE = 0.045;
    var OM_DRIFT_DEPTH = 0.55;

    function scheduleOmCycle() {
        if (!audioCtx || !ambientGain || !ambientPlaying) return;
        var now = audioCtx.currentTime;
        var tHoldStart = now + OM_FADE_IN;
        var tFadeOutStart = now + OM_FADE_IN + OM_HOLD;
        var tEnd = now + OM_CYCLE_TOTAL;
        ambientGain.gain.setValueAtTime(0, now);
        ambientGain.gain.linearRampToValueAtTime(OM_GAIN, tHoldStart);
        ambientGain.gain.setValueAtTime(OM_GAIN, tHoldStart);
        ambientGain.gain.linearRampToValueAtTime(OM_GAIN, tFadeOutStart);
        ambientGain.gain.linearRampToValueAtTime(0, tEnd);
        if (omFilter) {
            omFilter.frequency.cancelScheduledValues(now);
            omFilter.frequency.setValueAtTime(OM_FILTER_LOW, now);
            omFilter.frequency.linearRampToValueAtTime(OM_FILTER_MID, tHoldStart);
            omFilter.frequency.setValueAtTime(OM_FILTER_MID, tHoldStart);
            omFilter.frequency.linearRampToValueAtTime(OM_FILTER_MID, tFadeOutStart);
            omFilter.frequency.linearRampToValueAtTime(OM_FILTER_LOW, tEnd);
        }
        omCycleTimeout = setTimeout(scheduleOmCycle, OM_CYCLE_TOTAL * 1000);
    }

    function updateBreath() {
        if (!audioCtx || !breathGain || !ambientPlaying) return;
        var t = audioCtx.currentTime;
        breathGain.gain.value = 1 - OM_BREATH_DEPTH + OM_BREATH_DEPTH * Math.sin(2 * Math.PI * OM_BREATH_RATE * t);
        if (omOsc1 && omOsc2 && omOsc3) {
            var drift = OM_DRIFT_DEPTH * Math.sin(2 * Math.PI * OM_DRIFT_RATE * t);
            var vibrato = OM_VIBRATO_DEPTH * Math.sin(2 * Math.PI * OM_VIBRATO_RATE * t);
            var base = OM_BASE_FREQ + drift;
            omOsc1.frequency.value = base + vibrato;
            omOsc2.frequency.value = base * 2 + vibrato * 2;
            omOsc3.frequency.value = base * 1.5 + vibrato * 1.5;
        }
    }

    function startAmbient() {
        if (audioCtx && ambientPlaying) return;
        if (audioCtx && ambientGain) {
            ambientPlaying = true;
            if (soundToggle) {
                soundToggle.setAttribute('aria-label', 'Mute background sound');
                soundToggle.classList.add('is-playing');
            }
            if (breathGain) {
                omBreathInterval = setInterval(updateBreath, 50);
            }
            scheduleOmCycle();
            return;
        }
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            ambientGain = audioCtx.createGain();
            ambientGain.gain.value = 0;
            ambientGain.connect(audioCtx.destination);

            breathGain = audioCtx.createGain();
            breathGain.gain.value = 1;
            breathGain.connect(ambientGain);

            omFilter = audioCtx.createBiquadFilter();
            omFilter.type = 'lowpass';
            omFilter.frequency.value = OM_FILTER_LOW;
            omFilter.Q.value = 0.45;
            omFilter.connect(breathGain);

            var omFreq = OM_BASE_FREQ;
            var g1 = audioCtx.createGain();
            var g2 = audioCtx.createGain();
            var g3 = audioCtx.createGain();
            g1.gain.value = 1;
            g2.gain.value = 0.26;
            g3.gain.value = 0.12;
            g1.connect(omFilter);
            g2.connect(omFilter);
            g3.connect(omFilter);

            omOsc1 = audioCtx.createOscillator();
            omOsc1.type = 'sine';
            omOsc1.frequency.value = omFreq;
            omOsc1.connect(g1);
            omOsc1.start(0);

            omOsc2 = audioCtx.createOscillator();
            omOsc2.type = 'sine';
            omOsc2.frequency.value = omFreq * 2;
            omOsc2.connect(g2);
            omOsc2.start(0);

            omOsc3 = audioCtx.createOscillator();
            omOsc3.type = 'sine';
            omOsc3.frequency.value = omFreq * 1.5;
            omOsc3.connect(g3);
            omOsc3.start(0);

            var noiseGain = audioCtx.createGain();
            noiseGain.gain.value = 0.018;
            noiseGain.connect(breathGain);
            var noiseFilter = audioCtx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 550;
            noiseFilter.Q.value = 0.5;
            noiseFilter.connect(noiseGain);
            var bufferLength = audioCtx.sampleRate * 0.4;
            var noiseBuffer = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
            var data = noiseBuffer.getChannelData(0);
            for (var i = 0; i < bufferLength; i++) data[i] = (Math.random() * 2 - 1) * 0.7;
            var noiseSource = audioCtx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            noiseSource.connect(noiseFilter);
            noiseSource.start(0);

            function startLoop() {
                ambientPlaying = true;
                if (soundToggle) {
                    soundToggle.setAttribute('aria-label', 'Mute background sound');
                    soundToggle.classList.add('is-playing');
                }
                omBreathInterval = setInterval(updateBreath, 50);
                scheduleOmCycle();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(startLoop).catch(function () {});
            } else {
                startLoop();
            }
        } catch (e) {}
    }

    function stopAmbient() {
        if (omCycleTimeout) {
            clearTimeout(omCycleTimeout);
            omCycleTimeout = null;
        }
        if (omBreathInterval) {
            clearInterval(omBreathInterval);
            omBreathInterval = null;
        }
        if (ambientGain && audioCtx) {
            ambientGain.gain.cancelScheduledValues(audioCtx.currentTime);
            ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
            ambientPlaying = false;
            if (soundToggle) {
                soundToggle.setAttribute('aria-label', 'Play background sound');
                soundToggle.classList.remove('is-playing');
            }
        }
    }

    function toggleAmbient() {
        if (ambientPlaying) {
            stopAmbient();
        } else {
            startAmbient();
        }
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', function (e) {
            e.preventDefault();
            if (!audioCtx) startAmbient();
            else toggleAmbient();
        });
    }

    /* ----- Lucide icons (run early for static content) ----- */
    function initLucide() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }

    /* ----- Swiper: testimonials auto-scroll horizontal ----- */
    var testimonialsEl = document.querySelector('.testimonials-swiper');
    if (testimonialsEl && typeof Swiper !== 'undefined') {
        new Swiper('.testimonials-swiper', {
            slidesPerView: 1,
            spaceBetween: 24,
            loop: true,
            autoplay: {
                delay: 4500,
                disableOnInteraction: false
            },
            pagination: {
                el: '.testimonials-swiper .swiper-pagination',
                clickable: true
            },
            breakpoints: {
                640: { slidesPerView: 1.2, spaceBetween: 24 },
                1024: { slidesPerView: 2, spaceBetween: 32 },
                1280: { slidesPerView: 2.5, spaceBetween: 32 }
            },
            on: {
                init: function () { initLucide(); }
            }
        });
    }

    /* ----- Swiper: crystals slider (pause autoplay on card hover) ----- */
    var crystalsSwiperInstance = null;
    var crystalsEl = document.querySelector('.crystals-swiper');
    if (crystalsEl && typeof Swiper !== 'undefined') {
        crystalsSwiperInstance = new Swiper('.crystals-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            pagination: {
                el: '.crystals-pagination',
                clickable: true
            },
            breakpoints: {
                480: { slidesPerView: 1.2, spaceBetween: 20 },
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3.5, spaceBetween: 24 },
                1280: { slidesPerView: 4, spaceBetween: 24 }
            },
            on: {
                init: function () { initLucide(); }
            }
        });
        var cards = crystalsEl.querySelectorAll('.crystal-card');
        cards.forEach(function (card) {
            card.addEventListener('mouseenter', function () {
                if (crystalsSwiperInstance && crystalsSwiperInstance.autoplay) crystalsSwiperInstance.autoplay.stop();
            });
            card.addEventListener('mouseleave', function () {
                if (crystalsSwiperInstance && crystalsSwiperInstance.autoplay) crystalsSwiperInstance.autoplay.start();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLucide);
    } else {
        initLucide();
    }

    /* ----- Crystal interest modal ----- */
    var modal = document.getElementById('crystal-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');
    var modalClose = document.getElementById('modal-close');
    var crystalForm = document.getElementById('crystal-form');
    var formCrystalId = document.getElementById('form-crystal-id');
    var formCrystalName = document.getElementById('form-crystal-name');
    var formCrystalPrice = document.getElementById('form-crystal-price');
    var modalCrystalName = document.getElementById('modal-crystal-name');
    var modalEmail = document.getElementById('modal-email');

    function openCrystalModal(crystalName, crystalId, price) {
        if (modal && formCrystalId && formCrystalName && modalCrystalName) {
            formCrystalId.value = crystalId || crystalName || '';
            formCrystalName.value = crystalName || 'Crystal';
            formCrystalPrice.value = price || '';
            modalCrystalName.textContent = crystalName || 'this crystal';
            clearFieldError('modal-email');
            var crystalFormErrs = document.getElementById('crystal-form-errors');
            if (crystalFormErrs) { crystalFormErrs.hidden = true; crystalFormErrs.innerHTML = ''; }
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            if (modalEmail) modalEmail.value = '';
            modalEmail && modalEmail.focus();
        }
    }

    function closeCrystalModal() {
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    if (modalBackdrop) modalBackdrop.addEventListener('click', closeCrystalModal);
    if (modalClose) modalClose.addEventListener('click', closeCrystalModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeCrystalModal();
    });

    document.querySelectorAll('.btn-crystal-interest').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var card = btn.closest('.crystal-card');
            if (card) {
                var name = card.getAttribute('data-crystal-name');
                if (!name) {
                    var nameEl = card.querySelector('.crystal-name');
                    name = nameEl ? nameEl.textContent : 'Crystal';
                }
                var id = card.getAttribute('data-crystal-id');
                var priceEl = card.querySelector('.crystal-price');
                var price = priceEl ? priceEl.textContent.trim() : '';
                openCrystalModal(name, id, price);
            }
        });
    });

    if (crystalForm) {
        crystalForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var emailInput = document.getElementById('modal-email');
            var email = (emailInput && emailInput.value) ? emailInput.value.trim() : '';
            var formErrorsEl = document.getElementById('crystal-form-errors');
            clearFieldError('modal-email');
            if (formErrorsEl) { formErrorsEl.hidden = true; formErrorsEl.innerHTML = ''; }

            if (!email) {
                setFieldError('modal-email', 'Please enter your email address.');
                if (formErrorsEl) { formErrorsEl.hidden = false; formErrorsEl.innerHTML = '<ul><li>Please enter your email address.</li></ul>'; }
                return;
            }
            if (!isValidEmail(email)) {
                setFieldError('modal-email', 'Please enter a valid email address.');
                if (formErrorsEl) { formErrorsEl.hidden = false; formErrorsEl.innerHTML = '<ul><li>Please enter a valid email address.</li></ul>'; }
                return;
            }

            var submitBtn = crystalForm.querySelector('.modal-submit');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
            if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.indexOf('YOUR_') === 0) {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send'; }
                showErrorModal();
                return;
            }
            fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'crystal',
                    email: email,
                    productId: (formCrystalId && formCrystalId.value) || '',
                    productName: (formCrystalName && formCrystalName.value) || '',
                    price: (formCrystalPrice && formCrystalPrice.value) || ''
                })
            })
                .then(function () {
                    closeCrystalModal();
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send'; }
                    redirectToThankYou('index.html', '#crystals');
                })
                .catch(function () {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send'; }
                    showErrorModal();
                });
        });
    }

    /* ----- Booking modal (Book a reading / Book this) ----- */
    var bookingModal = document.getElementById('booking-modal');
    var bookingBackdrop = document.getElementById('booking-modal-backdrop');
    var bookingClose = document.getElementById('booking-modal-close');
    var bookingForm = document.getElementById('booking-form');
    var bookingReadingTypeInput = document.getElementById('booking-reading-type');
    var bookingStateSelect = document.getElementById('booking-state');
    var bookingCitySelect = document.getElementById('booking-city');

    var INDIAN_CITIES_API = 'https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json';
    var indianCitiesData = null;

    function populateBookingStates() {
        if (!bookingStateSelect || !indianCitiesData || !indianCitiesData.length) return;
        var states = [];
        var seen = {};
        for (var i = 0; i < indianCitiesData.length; i++) {
            var s = (indianCitiesData[i].state || '').trim();
            if (s && !seen[s]) { seen[s] = true; states.push(s); }
        }
        states.sort();
        bookingStateSelect.innerHTML = '';
        var opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = 'Select state';
        bookingStateSelect.appendChild(opt0);
        states.forEach(function (state) {
            var opt = document.createElement('option');
            opt.value = state;
            opt.textContent = state;
            bookingStateSelect.appendChild(opt);
        });
    }

    function populateBookingCities(stateName) {
        if (!bookingCitySelect || !indianCitiesData) return;
        var cities = [];
        for (var i = 0; i < indianCitiesData.length; i++) {
            if ((indianCitiesData[i].state || '').trim() === stateName) {
                var name = (indianCitiesData[i].name || '').trim();
                if (name) cities.push(name);
            }
        }
        cities.sort();
        bookingCitySelect.innerHTML = '';
        var opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = 'Select city';
        bookingCitySelect.appendChild(opt0);
        cities.forEach(function (city) {
            var opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            bookingCitySelect.appendChild(opt);
        });
        bookingCitySelect.disabled = false;
        bookingCitySelect.value = '';
    }

    function resetBookingStateCity() {
        if (bookingStateSelect) bookingStateSelect.value = '';
        if (bookingCitySelect) {
            bookingCitySelect.innerHTML = '<option value="">Select city</option>';
            bookingCitySelect.disabled = true;
            bookingCitySelect.value = '';
        }
    }

    fetch(INDIAN_CITIES_API)
        .then(function (r) { return r.json(); })
        .then(function (arr) {
            indianCitiesData = Array.isArray(arr) ? arr : [];
            populateBookingStates();
        })
        .catch(function () {
            indianCitiesData = [];
            if (bookingStateSelect) {
                var opt = bookingStateSelect.querySelector('option[value=""]');
                if (opt) opt.textContent = 'Select state (load failed)';
            }
        });

    if (bookingStateSelect) {
        bookingStateSelect.addEventListener('change', function () {
            var state = (this.value || '').trim();
            if (!state) {
                if (bookingCitySelect) {
                    bookingCitySelect.innerHTML = '<option value="">Select city</option>';
                    bookingCitySelect.disabled = true;
                    bookingCitySelect.value = '';
                }
            } else {
                populateBookingCities(state);
            }
        });
    }

    function openBookingModal(readingType) {
        if (bookingModal) {
            if (bookingReadingTypeInput) bookingReadingTypeInput.value = readingType || '';
            resetBookingStateCity();
            bookingModal.setAttribute('aria-hidden', 'false');
            bookingModal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            try { bookingModal.dispatchEvent(new CustomEvent('modal-opened')); } catch (e) {}
            var firstInput = bookingModal.querySelector('.modal-input, .booking-select');
            if (firstInput) firstInput.focus();
        }
    }

    function closeBookingModal() {
        if (bookingModal) {
            bookingModal.classList.remove('is-open');
            bookingModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    if (bookingBackdrop) bookingBackdrop.addEventListener('click', closeBookingModal);
    if (bookingClose) bookingClose.addEventListener('click', closeBookingModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('is-open')) closeBookingModal();
    });

    var bookingReturnHash = '#book';
    document.querySelectorAll('.btn-open-booking, #btn-open-booking').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var readingType = btn.getAttribute('data-reading-type') || '';
            bookingReturnHash = readingType ? '#pricing' : '#book';
            openBookingModal(readingType);
        });
    });

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

    var bookingFieldIds = ['booking-name', 'booking-email', 'booking-phone', 'booking-state', 'booking-city', 'booking-age'];
    if (bookingModal) {
        bookingModal.addEventListener('modal-opened', function () {
            clearFormErrors('booking-form-errors', bookingFieldIds);
        });
    }
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var nameEl = document.getElementById('booking-name');
            var emailEl = document.getElementById('booking-email');
            var phoneEl = document.getElementById('booking-phone');
            var cityEl = document.getElementById('booking-city');
            var stateEl = document.getElementById('booking-state');
            var ageEl = document.getElementById('booking-age');
            var name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
            var email = (emailEl && emailEl.value) ? emailEl.value.trim() : '';
            var phone = (phoneEl && phoneEl.value) ? phoneEl.value.trim() : '';
            var state = (stateEl && stateEl.value) ? stateEl.value.trim() : '';
            var city = (cityEl && cityEl.value) ? cityEl.value.trim() : '';
            var ageRaw = (ageEl && ageEl.value) ? ageEl.value.trim() : '';
            var formErrorsEl = document.getElementById('booking-form-errors');
            clearFormErrors('booking-form-errors', bookingFieldIds);

            var hasError = false;
            if (!name) { setFieldError('booking-name', 'Please enter your name.'); hasError = true; }
            if (!email) { setFieldError('booking-email', 'Please enter your email address.'); hasError = true; }
            else if (!isValidEmail(email)) { setFieldError('booking-email', 'Please enter a valid email address.'); hasError = true; }
            if (!phone) { setFieldError('booking-phone', 'Please enter your phone number.'); hasError = true; }
            else if (phone.replace(/\D/g, '').length < 10) { setFieldError('booking-phone', 'Please enter a valid phone number (at least 10 digits).'); hasError = true; }
            if (!state) { setFieldError('booking-state', 'Please select your state.'); hasError = true; }
            if (!city) { setFieldError('booking-city', 'Please select your city.'); hasError = true; }
            var age = parseInt(ageRaw, 10);
            if (!ageRaw) { setFieldError('booking-age', 'Please enter your age.'); hasError = true; }
            else if (isNaN(age) || age < 18 || age > 120) { setFieldError('booking-age', 'Please enter a valid age (18–120).'); hasError = true; }

            if (hasError && formErrorsEl) {
                formErrorsEl.hidden = false;
                formErrorsEl.innerHTML = '<ul><li>Please correct the errors below and try again.</li></ul>';
                return;
            }

            var submitBtn = bookingForm.querySelector('.modal-submit');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
            if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.indexOf('YOUR_') === 0) {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
                showErrorModal();
                return;
            }
            var data = {
                name: name,
                email: email,
                phone: phone,
                preferredDate: (document.getElementById('booking-date') && document.getElementById('booking-date').value) || '',
                preferredTime: (document.getElementById('booking-time') && document.getElementById('booking-time').value) || '',
                city: city,
                state: state,
                age: String(age),
                readingType: (bookingReadingTypeInput && bookingReadingTypeInput.value) || ''
            };
            fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign({ formType: 'booking' }, data))
            })
                .then(function () {
                    closeBookingModal();
                    bookingForm.reset();
                    resetBookingStateCity();
                    if (bookingReadingTypeInput) bookingReadingTypeInput.value = '';
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
                    redirectToThankYou('index.html', bookingReturnHash || '#book');
                })
                .catch(function () {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
                    showErrorModal();
                });
        });
    }

    /* ----- Featured articles (from articles/manifest.json) ----- */
    var FEATURED_COUNT = 3;
    var featuredContainer = document.getElementById('featured-articles');
    function formatArticleDate(dateStr) {
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    if (featuredContainer) {
        fetch('articles/manifest.json')
            .then(function (r) { return r.json(); })
            .then(function (articles) {
                articles.slice(0, FEATURED_COUNT).forEach(function (a) {
                    var card = document.createElement('a');
                    card.href = 'article.html?slug=' + encodeURIComponent(a.slug);
                    card.className = 'article-card';
                    card.innerHTML =
                        '<div class="article-card-image" aria-hidden="true"><i data-lucide="book-open" style="width:48px;height:48px;"></i></div>' +
                        '<div class="article-card-body">' +
                        '<h3 class="article-card-title">' + escapeHtml(a.title) + '</h3>' +
                        '<time class="article-card-date" datetime="' + escapeHtml(a.date) + '">' + formatArticleDate(a.date) + '</time>' +
                        '<p class="article-card-excerpt">' + escapeHtml(a.excerpt || '') + '</p>' +
                        '</div>';
                    featuredContainer.appendChild(card);
                });
                if (typeof lucide !== 'undefined') lucide.createIcons();
            })
            .catch(function () {
                featuredContainer.innerHTML = '<p class="section-lead">Articles will appear here. Add .md files in the <code>articles/</code> folder and run <code>node build-articles.js</code>.</p>';
            });
    }

    /* ----- Tarot classes modal (opens after 20s or via link) ----- */
    var tarotModal = document.getElementById('tarot-classes-modal');
    var tarotModalBackdrop = document.getElementById('tarot-classes-modal-backdrop');
    var tarotModalClose = document.getElementById('tarot-classes-modal-close');
    var TAROT_MODAL_STORAGE_KEY = 'tarotClassesModalClosed';

    function openTarotClassesModal() {
        var el = document.getElementById('tarot-classes-modal');
        if (el) {
            el.setAttribute('aria-hidden', 'false');
            el.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
    function closeTarotClassesModal() {
        var el = document.getElementById('tarot-classes-modal');
        if (el) {
            el.classList.remove('is-open');
            el.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
        try { sessionStorage.setItem(TAROT_MODAL_STORAGE_KEY, '1'); } catch (e) {}
    }

    setTimeout(function () {
        try {
            if (sessionStorage.getItem(TAROT_MODAL_STORAGE_KEY) === '1') return;
        } catch (e) {}
        openTarotClassesModal();
    }, 20000);

    if (window.location.hash === '#open-tarot-modal') {
        openTarotClassesModal();
        history.replaceState(null, '', window.location.pathname || 'index.html');
    }

    if (tarotModalBackdrop) tarotModalBackdrop.addEventListener('click', closeTarotClassesModal);
    if (tarotModalClose) tarotModalClose.addEventListener('click', closeTarotClassesModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && tarotModal && tarotModal.classList.contains('is-open')) closeTarotClassesModal();
    });

    document.querySelectorAll('[data-open-tarot-modal]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            openTarotClassesModal();
            if (navLinks && navLinks.classList.contains('open')) closeNav();
        });
    });

    document.querySelectorAll('.tarot-classes-close-on-click').forEach(function (el) {
        el.addEventListener('click', function () { closeTarotClassesModal(); });
    });

    window.startShuffle = drawCards;
})();
