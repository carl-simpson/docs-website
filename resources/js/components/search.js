import docsearch from '@docsearch/js';

// Initialize DocSearch
function initDocSearch() {
    const docsearchContainer = document.getElementById('docsearch');

    if (!docsearchContainer) {
        console.warn('DocSearch container not found.');
        return;
    }

    // Get Algolia credentials from data attributes
    const algoliaAppId = docsearchContainer.dataset.algoliaAppId;
    const algoliaSearchKey = docsearchContainer.dataset.algoliaSearchKey;
    const algoliaIndexName = docsearchContainer.dataset.algoliaIndexName || 'devmage-os';

    // Check if Algolia credentials are available
    if (!algoliaAppId || !algoliaSearchKey) {
        console.warn('Algolia credentials not found. Search functionality will be disabled.');
        return;
    }

    // Initialize DocSearch
    const docSearchInstance = docsearch({
        container: '#docsearch',
        appId: algoliaAppId,
        apiKey: algoliaSearchKey,
        indexName: algoliaIndexName,
        searchParameters: {},
    });

    // DocSearch 3.9 wraps Tab and handles Cmd/Ctrl+K, '/' and Escape itself. It does not
    // return focus to the trigger on close, lets Shift+Tab leave the modal after a click
    // on blank modal space, and gives the modal no dialog role. This complements it from
    // outside, with no key handling of our own.
    let opener = null;

    // The merchant keeps its own DocSearch button in a hidden container, so the
    // visible triggers are the header and mobile menu buttons.
    const isVisible = (el) => !!el && el.isConnected && el.getClientRects().length > 0;

    const guard = (e) => {
        const modal = document.querySelector('.DocSearch-Modal');
        const input = document.querySelector('.DocSearch-Input');
        if (modal && input && !modal.contains(e.target)) {
            input.focus();
        }
    };

    const onOpen = (container) => {
        const active = document.activeElement;
        if (!opener && active && active !== document.body && !container.contains(active)) {
            opener = active;
        }
        const modal = container.querySelector('.DocSearch-Modal');
        if (modal) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Search the documentation');
        }
        document.addEventListener('focusin', guard, true);
    };

    // Restore on the next tick: a click on the overlay closes DocSearch on mousedown, and
    // the browser then moves focus to BODY as the default action of that mousedown.
    const onClose = () => {
        document.removeEventListener('focusin', guard, true);
        const from = opener;
        opener = null;
        window.setTimeout(() => {
            const active = document.activeElement;
            if (active && active !== document.body) {
                return;
            }
            // A trigger inside the mobile menu panel is no use once the panel is closing.
            const usable = (el) => isVisible(el) && !el.closest('[aria-hidden="true"]');
            const target = [from,
                document.getElementById('header-search'),
                document.getElementById('mobile-header-search'),
                document.querySelector('[data-mobile-menu-toggle]')].find(usable);
            if (target) {
                target.focus({ preventScroll: true });
            }
        }, 0);
    };

    const isContainer = (node) => node.nodeType === 1 && node.classList.contains('DocSearch-Container');

    new MutationObserver((records) => {
        records.forEach((record) => {
            record.addedNodes.forEach((n) => { if (isContainer(n)) { onOpen(n); } });
            record.removedNodes.forEach((n) => { if (isContainer(n)) { onClose(); } });
        });
    }).observe(document.body, { childList: true });

    // Function to trigger search modal
    const triggerSearch = () => {
        // Try to find and click the DocSearch button
        const searchButton = document.querySelector('.DocSearch-Button') ||
                             document.querySelector('[data-docsearch-placeholder]');

        if (searchButton) {
            searchButton.click();
        } else {
            // If DocSearch button not found, try to trigger it manually
            setTimeout(() => {
                const retryButton = document.querySelector('.DocSearch-Button');
                if (retryButton) {
                    retryButton.click();
                }
            }, 100);
        }
    };

    // Handle homepage search button
    const homepageSearchBtn = document.getElementById('homepage-search');
    if (homepageSearchBtn) {
        homepageSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            opener = e.currentTarget;
            triggerSearch();
        });
    }

    // Handle header search button
    const headerSearchBtn = document.getElementById('header-search');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            opener = e.currentTarget;
            triggerSearch();
        });
    }

    // Handle mobile header search button
    const mobileHeaderSearchBtn = document.getElementById('mobile-header-search');
    if (mobileHeaderSearchBtn) {
        mobileHeaderSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            opener = e.currentTarget;
            triggerSearch();
        });
    }

    // Search bar inside the merchant mobile menu: bound directly so it is recorded as the opener
    // and focus returns to it (inside the open menu) when search closes.
    const mobileMenuSearchBtn = document.getElementById('mobile-menu-search');
    if (mobileMenuSearchBtn) {
        mobileMenuSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            opener = e.currentTarget;
            triggerSearch();
        });
    }
}

// Check if DOM is already loaded (module scripts defer by default)
// If so, run immediately; otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocSearch);
} else {
    // DOM is already ready, run immediately
    initDocSearch();
}
