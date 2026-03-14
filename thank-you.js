/* Thank you page: only valid when arrived from successful form submit; countdown then redirect back */
(function () {
    'use strict';

    var RETURN_URL_KEY = 'divineway_returnUrl';
    var RETURN_HASH_KEY = 'divineway_returnHash';

    var returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
    var returnHash = sessionStorage.getItem(RETURN_HASH_KEY) || '';

    if (!returnUrl) {
        window.location.replace('index.html');
        return;
    }

    sessionStorage.removeItem(RETURN_URL_KEY);
    sessionStorage.removeItem(RETURN_HASH_KEY);

    var redirectTarget = returnUrl + (returnHash ? (returnHash.indexOf('#') === 0 ? returnHash : '#' + returnHash) : '');
    var countEl = document.getElementById('thank-you-countdown');
    var linkNow = document.getElementById('thank-you-link-now');
    if (linkNow) linkNow.href = redirectTarget;

    var seconds = 10;
    var timer = setInterval(function () {
        seconds--;
        if (countEl) countEl.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(timer);
            window.location.href = redirectTarget;
        }
    }, 1000);
})();
