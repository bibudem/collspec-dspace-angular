(function () {
  'use strict';

  function hasActiveFilters() {
    var params = new URLSearchParams(window.location.search);

    var hasQuery = params.get('query');
    var hasFilters = false;

    params.forEach(function (value, key) {
      if (key.startsWith('f.')) {
        hasFilters = true;
      }
    });

    return !!(hasQuery || hasFilters);
  }

  function getScrollTarget() {
    return (
      document.getElementById('search-content') ||
      document.querySelector('ds-search-results')
    );
  }

  function scrollToResults() {
    var target = getScrollTarget();
    if (!target) return;

    var offset = 100;

    // position ABSOLUE fiable
    var top =
      target.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top: top < 0 ? 0 : top,
      behavior: 'smooth'
    });
  }

  function waitForRenderAndScroll() {
    if (!hasActiveFilters()) return;

    var tries = 0;

    function tryScroll() {
      var target = getScrollTarget();

      if (target && target.offsetHeight > 0) {
        scrollToResults();
      } else if (tries < 10) {
        tries++;
        requestAnimationFrame(tryScroll);
      }
    }

    requestAnimationFrame(tryScroll);
  }

  function watchForSearchResults() {
    var observer = new MutationObserver(function () {
      waitForRenderAndScroll();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  function attachSearchListeners() {
    // Submit
    document.addEventListener(
      'submit',
      function (e) {
        var form = e.target.closest(
          'form[action="/search"], ds-base-search-form form'
        );
        if (!form) return;

        var obs = watchForSearchResults();

        setTimeout(function () {
          if (obs) obs.disconnect();
        }, 4000);
      },
      true
    );

    // Click bouton
    document.addEventListener(
      'click',
      function (e) {
        var btn = e.target.closest(
          'button[data-test="search-button"], .search-button'
        );
        if (!btn) return;

        var obs = watchForSearchResults();

        setTimeout(function () {
          if (obs) obs.disconnect();
        }, 4000);
      },
      true
    );

    // SPA navigation
    var lastHref = location.href;

    new MutationObserver(function () {
      if (location.href !== lastHref) {
        lastHref = location.href;

        waitForRenderAndScroll();
      }
    }).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachSearchListeners);
  } else {
    attachSearchListeners();
  }
})();