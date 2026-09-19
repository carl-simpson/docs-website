/*
 * Contributor box for the developer documentation.
 *
 * One box under every dev-docs page: a podium of the top 3 contributors, a "places"
 * meter for the top 10 (with the full list behind a toggle), and two ways to earn a
 * place: "Suggest an idea" (GitHub issue form, or email) and "Improve this page"
 * (the page's GitHub edit link).
 *
 * Data: a locally-baked contributors.json (written by the generator at build time),
 * so visitors never hit the rate-limited GitHub API. The per-page edit URL comes from
 * <meta name="edit-url">; pages without it (the landing) hide the "Improve this page" card.
 *
 * Included on every dev-docs page as:  <script src="includes/contributors.js"></script>
 */
(function () {
    // TEST fork — switch to magentoopensource/docs before upstream PR
    var IDEA_REPO = 'carl-simpson/docs';

    /*
     * Shared contract (MA-DOCS-IDEAS-WIDGET.md §6): template names, field id `page_url`,
     * title prefixes and mail subject format must stay identical to the issue forms and the
     * merchant-docs Blade component.
     */
    var IDEA_ISSUE_URL = 'https://github.com/' + IDEA_REPO + '/issues/new';
    var IDEA_MAIL_PARTS = ['carl', 'qbdigital.co.uk']; // interim inbox until the Association address is confirmed (D1)
    var IDEA_TITLE_SUFFIX = ' — Magento 2 Developer Documentation';
    var IDEA_TYPES = {
        content: { template: 'idea-content.yml', titlePrefix: '[Docs topic] ', mailLabel: 'Topic' },
        website: { template: 'idea-website.yml', titlePrefix: '[Website] ', mailLabel: 'Website' }
    };
    var PLACES = 10;
    var LINE = 'border-[#e4e2e0]';
    var TINT = 'bg-[#f5f3f1]';
    // Gold / silver / bronze rank badges (tokens from the page's Tailwind config).
    var RANK = ['bg-yellow-400 text-yellow-900', 'bg-charcoal-100 text-charcoal-400', 'bg-orange-300 text-orange-800'];

    var GITHUB_MARK = '<svg class="w-4 h-4 flex-none" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
    var EDIT_ICON = '<svg class="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>';
    var INFO_ICON = '<svg class="inline-block w-[13px] h-[13px] mr-1 align-[-2px]" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"/></svg>';
    var CHEVRON = '<svg data-cbox-chevron class="w-3.5 h-3.5 group-aria-expanded:rotate-180 transition-transform duration-200 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    var FOCUS = 'focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-orange';

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // Only https URLs reach an href/src (the JSON and meta are ours, but never trust a scheme).
    function safeUrl(u) {
        var s = String(u == null ? '' : u);
        return /^https:\/\//i.test(s) ? s : '';
    }

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    function normalise(data) {
        if (!Array.isArray(data)) { return []; }
        var list = data.filter(function (c) {
            return c && c.login && safeUrl(c.html_url) && safeUrl(c.avatar_url);
        }).map(function (c, i) {
            return { login: String(c.login), html_url: c.html_url, avatar_url: c.avatar_url, contributions: Number(c.contributions || 0), i: i };
        });
        // Highest first; ties keep their baked order.
        list.sort(function (a, b) { return (b.contributions - a.contributions) || (a.i - b.i); });
        return list.slice(0, PLACES);
    }

    /* ---------- Idea links (built in the browser; no form, no endpoint) ---------- */

    function ideaPageTitle() {
        var t = String(document.title || '');
        var i = t.lastIndexOf(IDEA_TITLE_SUFFIX);
        if (i !== -1 && i === t.length - IDEA_TITLE_SUFFIX.length) { t = t.slice(0, i); }
        return t.replace(/^\s+|\s+$/g, '');
    }

    function ideaPageUrl() {
        return String(window.location.href).split('#')[0];
    }

    function ideaGithubUrl(type) {
        var cfg = IDEA_TYPES[type] || IDEA_TYPES.content;
        // Website ideas are about this page, so the title carries it; topic ideas start blank.
        var title = type === 'website' ? cfg.titlePrefix + ideaPageTitle() : cfg.titlePrefix;
        return IDEA_ISSUE_URL +
            '?template=' + encodeURIComponent(cfg.template) +
            '&title=' + encodeURIComponent(title) +
            '&page_url=' + encodeURIComponent(ideaPageUrl());
    }

    function ideaMailUrl(type) {
        var website = type === 'website';
        var cfg = website ? IDEA_TYPES.website : IDEA_TYPES.content;
        var subject = '[Docs idea – ' + cfg.mailLabel + '] ' + ideaPageTitle();
        var body = 'Page: ' + ideaPageUrl() + '\n\n' +
            (website
                ? 'What should we improve?\n\n\nWhy would it help?\n\n'
                : 'What topic is missing?\n\n\nWho is it for? (merchant / developer / both)\n\n') +
            '\n—\nSent from the docs “Suggest an idea” widget';
        return 'mailto:' + IDEA_MAIL_PARTS.join('@') +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body);
    }

    /* ---------- Head: kicker, heading, podium ---------- */

    function podiumStep(c, rank) {
        var lg = rank === 1;
        var size = lg ? 'w-[60px] h-[60px]' : 'w-[50px] h-[50px]';
        return '' +
            '<a data-cbox-step="' + rank + '" href="' + esc(c.html_url) + '" target="_blank" rel="noopener noreferrer" ' +
            'class="group grid justify-items-center gap-1.5 text-charcoal no-underline ' + FOCUS + '">' +
                '<span class="relative block ' + size + ' border-2 border-white outline outline-1 outline-[#e4e2e0] bg-charcoal-100">' +
                    '<img src="' + esc(c.avatar_url) + '" alt="" width="60" height="60" loading="lazy" class="block w-full h-full object-cover" />' +
                    '<span class="absolute -top-2 -right-2 grid place-items-center w-[19px] h-[19px] text-[10px] font-extrabold ' + RANK[rank - 1] + '" aria-hidden="true">' + rank + '</span>' +
                '</span>' +
                '<span class="max-w-[96px] truncate text-xs font-semibold group-hover:underline group-hover:decoration-orange group-hover:underline-offset-[3px]">' +
                    '<span class="sr-only">Rank ' + rank + ', </span>' + esc(c.login) +
                '</span>' +
                '<span class="font-mono text-[11px] font-medium tabular-nums text-orange-700">' +
                    esc(c.contributions.toLocaleString()) + '<span class="sr-only"> contributions (opens GitHub profile in a new tab)</span>' +
                '</span>' +
            '</a>';
    }

    function podium(list) {
        if (!list.length) { return ''; }
        // Visual order: #2 left, #1 middle (larger), #3 right.
        var steps = [[list[1], 2], [list[0], 1], [list[2], 3]].filter(function (p) { return p[0]; })
            .map(function (p) { return podiumStep(p[0], p[1]); }).join('');
        return '<div data-cbox-podium class="flex items-end gap-2" role="group" aria-label="Top 3 contributors">' + steps + '</div>';
    }

    function head(list) {
        return '' +
            '<div class="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-x-7 gap-y-[18px] items-start sm:items-end px-6 pt-6 pb-5 border-b ' + LINE + '">' +
                '<div>' +
                    '<div class="inline-flex items-center gap-2 mb-2.5 font-mono text-[11px] font-medium leading-none tracking-[0.12em] uppercase text-orange-700">' +
                        '<i class="inline-block w-2.5 h-2.5 bg-orange" aria-hidden="true"></i>Written by the community' +
                    '</div>' +
                    '<h2 id="dev-cbox-title" class="m-0 mb-1.5 text-xl sm:text-2xl leading-tight font-extrabold tracking-[-0.015em] text-charcoal [text-wrap:balance]">Help build the Magento docs, and get your name on them</h2>' +
                    '<p class="m-0 max-w-[52ch] text-sm text-charcoal-300">Every merged edit counts toward the top 10 contributors shown on every page. Ideas shape what we write next.</p>' +
                '</div>' +
                podium(list) +
            '</div>';
    }

    /* ---------- Places meter + top 10 ---------- */

    function places(list) {
        var taken = list.length;
        var open = PLACES - taken;
        var cells = '';
        for (var i = 0; i < PLACES; i++) {
            var cls = i < taken ? 'bg-charcoal border border-charcoal'
                : (i === taken ? 'bg-orange-50 border-2 border-orange' : 'bg-white border border-dashed border-charcoal-200');
            cells += '<span data-cbox-cell="' + (i < taken ? 'on' : (i === taken ? 'next' : 'open')) + '" class="h-4 ' + cls + '"></span>';
        }
        var text = '<b class="font-bold">' + taken + ' of ' + PLACES + '</b> places taken.' +
            (open > 0
                ? ' <em class="not-italic font-semibold text-orange-700">' + open + ' open.</em> Place #' + (taken + 1) + ' is yours with 1 contribution.'
                : '');
        return '' +
            '<div class="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 px-6 py-3.5 ' + TINT + ' border-b ' + LINE + '">' +
                '<div class="flex flex-wrap items-center gap-3">' +
                    '<div class="grid grid-cols-[repeat(10,16px)] gap-1" aria-hidden="true">' + cells + '</div>' +
                    '<span data-cbox-meter-text class="text-sm text-charcoal">' + text + '</span>' +
                '</div>' +
                '<button data-cbox-toggle type="button" aria-expanded="false" aria-controls="dev-cbox-top10" ' +
                'class="inline-flex items-center gap-1.5 bg-transparent border-0 py-1 px-0 cursor-pointer text-sm font-semibold text-charcoal underline decoration-orange decoration-2 underline-offset-4 group ' + FOCUS + '">' +
                    '<span data-cbox-toggle-label>See the top 10</span>' + CHEVRON +
                '</button>' +
            '</div>';
    }

    function topRow(c, pos, taken) {
        var num = '<span class="font-mono text-xs font-medium tabular-nums text-charcoal-300">' + pad2(pos) + '</span>';
        var base = 'grid grid-cols-[26px_30px_minmax(0,1fr)_auto] gap-2.5 items-center py-2 border-b ' + LINE + ' text-sm break-inside-avoid';
        if (c) {
            return '' +
                '<li data-cbox-row="' + pos + '" class="' + base + '">' + num +
                    '<span class="block w-[30px] h-[30px] border border-white outline outline-1 outline-[#e4e2e0] bg-charcoal-100"><img src="' + esc(c.avatar_url) + '" alt="" width="30" height="30" loading="lazy" class="block w-full h-full object-cover" /></span>' +
                    '<span class="truncate font-semibold text-charcoal">' + esc(c.login) + '</span>' +
                    '<span class="font-mono text-xs font-medium tabular-nums px-[7px] py-0.5 bg-orange-100 text-orange-700">' + esc(c.contributions.toLocaleString()) + '<span class="sr-only"> contributions</span></span>' +
                '</li>';
        }
        var next = pos === taken + 1;
        return '' +
            '<li data-cbox-row="' + pos + '" data-cbox-open="' + (next ? 'next' : 'open') + '" class="' + base + '">' + num +
                '<span class="block w-[30px] h-[30px] ' + (next ? 'border-2 border-orange bg-orange-50' : 'border border-dashed border-charcoal-200') + '" aria-hidden="true"></span>' +
                '<span class="truncate ' + (next ? 'font-medium text-charcoal' : 'font-medium text-charcoal-300') + '">' + (next ? 'Open place, this could be you' : 'Open place') + '</span>' +
                '<span></span>' +
            '</li>';
    }

    function top10(list) {
        var rows = '';
        for (var p = 1; p <= PLACES; p++) { rows += topRow(list[p - 1], p, list.length); }
        return '' +
            '<div id="dev-cbox-top10" class="px-6 pt-2 pb-4 border-b ' + LINE + '" hidden>' +
                '<ol class="list-none m-0 p-0 columns-1 sm:columns-2 gap-x-7">' + rows + '</ol>' +
                '<p class="mt-3 mb-0 text-xs text-charcoal-300">Counts combine the <code class="font-mono">docs</code> and <code class="font-mono">docs-website</code> repositories. Updated when the site is rebuilt.</p>' +
            '</div>';
    }

    /* ---------- Ways to contribute ---------- */

    function chip(label) {
        return '<span class="font-mono text-[10px] font-medium leading-none tracking-[0.1em] uppercase whitespace-nowrap text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-1">' + label + '</span>';
    }

    function ideaChoice(value, label, hint, checked, extraClass) {
        return '' +
            '<label class="relative block ' + extraClass + '">' +
                '<input type="radio" name="dev-idea-type" value="' + esc(value) + '"' + (checked ? ' checked' : '') + ' class="peer absolute inset-0 z-10 m-0 w-full h-full opacity-0 cursor-pointer" />' +
                '<span class="grid gap-px h-full px-3 py-[9px] cursor-pointer text-charcoal peer-[:not(:checked):hover]:bg-[#f5f3f1] peer-checked:bg-charcoal peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:-outline-offset-[3px] peer-focus-visible:outline-orange">' +
                    '<strong class="text-[13px] font-semibold">' + esc(label) + '</strong>' +
                    '<small class="text-[11.5px] leading-[1.35] opacity-80">' + esc(hint) + '</small>' +
                '</span>' +
            '</label>';
    }

    function ideaCard() {
        return '' +
            '<div data-cbox-idea class="grid gap-3.5 content-start px-6 pt-5 pb-[22px]">' +
                '<div class="flex flex-wrap justify-between items-baseline gap-2.5"><h3 class="m-0 text-base font-bold text-charcoal">Suggest an idea</h3>' + chip('Credited in the issue') + '</div>' +
                '<p class="-mt-2 mb-0 text-[13px] text-charcoal-300">Something missing, or something we could do better? No code needed.</p>' +
                '<fieldset class="m-0 p-0 border-0 min-w-0">' +
                    '<legend class="sr-only">What kind of idea is it?</legend>' +
                    '<div class="grid grid-cols-1 min-[421px]:grid-cols-2 border border-charcoal">' +
                        ideaChoice('content', 'A docs topic', 'New content or a missing subject', true, '') +
                        ideaChoice('website', 'This website', 'Navigation, search, layout', false, 'border-t min-[421px]:border-t-0 min-[421px]:border-l border-charcoal') +
                    '</div>' +
                '</fieldset>' +
                '<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">' +
                    '<a data-dev-idea-github href="' + esc(ideaGithubUrl('content')) + '" target="_blank" rel="noopener noreferrer" ' +
                    'class="inline-flex items-center justify-center gap-2 px-[15px] py-2.5 bg-orange-700 hover:bg-orange-800 border-2 border-orange-700 hover:border-orange-800 text-white hover:text-white text-sm font-semibold no-underline ' + FOCUS.replace('outline-orange', 'outline-charcoal') + '">' +
                        GITHUB_MARK + 'Suggest on GitHub<span class="sr-only"> (opens in a new tab)</span>' +
                    '</a>' +
                    '<a data-dev-idea-mail href="#" ' +
                    'class="py-1 text-[13px] font-medium text-charcoal underline decoration-orange decoration-2 underline-offset-4 hover:text-orange-700 ' + FOCUS + '">' +
                        '<span class="text-charcoal-300">No GitHub account?</span> Email us' +
                    '</a>' +
                '</div>' +
            '</div>';
    }

    function editCard(editUrl) {
        return '' +
            '<div data-cbox-edit class="grid gap-3.5 content-start px-6 pt-5 pb-[22px] border-t md:border-t-0 md:border-l ' + LINE + '">' +
                '<div class="flex flex-wrap justify-between items-baseline gap-2.5"><h3 class="m-0 text-base font-bold text-charcoal">Improve this page</h3>' + chip('Counts toward the top 10') + '</div>' +
                '<p class="-mt-2 mb-0 text-[13px] text-charcoal-300">Spotted something wrong? Fix it directly. Your edit becomes a pull request we review.</p>' +
                '<ul class="list-none m-0 p-0 grid gap-1.5 text-[13px] text-[#4b4b4b]">' +
                    ['Typos and unclear wording', 'Steps that changed in Magento 2.4.8', 'Missing examples or screenshots'].map(function (t) {
                        return '<li class="grid grid-cols-[10px_minmax(0,1fr)] gap-[9px]"><span class="w-1.5 h-1.5 mt-[7px] bg-orange" aria-hidden="true"></span><span>' + t + '</span></li>';
                    }).join('') +
                '</ul>' +
                '<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">' +
                    '<a data-cbox-edit-link href="' + esc(editUrl) + '" target="_blank" rel="noopener noreferrer" ' +
                    'class="inline-flex items-center justify-center gap-2 px-[15px] py-2.5 bg-white hover:bg-charcoal border-2 border-charcoal text-charcoal hover:text-white text-sm font-semibold no-underline ' + FOCUS + '">' +
                        EDIT_ICON + 'Edit this page on GitHub<span class="sr-only"> (opens in a new tab)</span>' +
                    '</a>' +
                '</div>' +
            '</div>';
    }

    function ways(editUrl) {
        var cols = editUrl ? 'md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]' : '';
        return '<div class="grid grid-cols-1 ' + cols + '">' + ideaCard() + (editUrl ? editCard(editUrl) : '') + '</div>';
    }

    function boxHtml(list, editUrl) {
        return '' +
            '<section data-dev-cbox class="mt-9 mb-10 border-2 border-charcoal bg-white font-sans text-charcoal [overflow-wrap:anywhere]" aria-labelledby="dev-cbox-title">' +
                head(list) +
                places(list) +
                top10(list) +
                ways(editUrl) +
                '<div class="flex flex-wrap justify-between gap-x-4 gap-y-1.5 px-6 py-[11px] border-t ' + LINE + ' text-xs text-charcoal-300">' +
                    '<span>' + INFO_ICON + 'Ideas and edits on GitHub are public.</span>' +
                    '<span>Emailed ideas go straight to the docs team.</span>' +
                '</div>' +
            '</section>';
    }

    /* ---------- Behaviour (bound after injection; no inline handlers) ---------- */

    function bind(box) {
        var github = box.querySelector('[data-dev-idea-github]');
        var mail = box.querySelector('[data-dev-idea-mail]');
        var toggle = box.querySelector('[data-cbox-toggle]');
        var list = box.querySelector('#dev-cbox-top10');

        function selectedType() {
            var checked = box.querySelector('input[name="dev-idea-type"]:checked');
            return checked && checked.value === 'website' ? 'website' : 'content';
        }
        function syncGithub() { if (github) { github.setAttribute('href', ideaGithubUrl(selectedType())); } }

        box.addEventListener('change', function (e) {
            if (e.target && e.target.name === 'dev-idea-type') { syncGithub(); }
        });
        if (github) {
            // Refresh before activation too, so a page title/URL change since render is picked up.
            github.addEventListener('click', syncGithub);
            github.addEventListener('auxclick', syncGithub);
        }
        if (mail) {
            // The address is assembled only at click time; it is never in the rendered HTML.
            mail.addEventListener('click', function () {
                mail.setAttribute('href', ideaMailUrl(selectedType()));
            });
        }
        if (toggle && list) {
            var label = toggle.querySelector('[data-cbox-toggle-label]');
            toggle.addEventListener('click', function () {
                var open = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
                list.hidden = open;
                if (label) { label.textContent = open ? 'See the top 10' : 'Hide the top 10'; }
            });
        }
    }

    function inject(html) {
        var container = document.createElement('div');
        container.innerHTML = html;
        var node = container.firstChild;
        // Preferred: the #dev-contributors placeholder (inside the content column on guide pages).
        var target = document.getElementById('dev-contributors');
        if (target) {
            target.appendChild(node);
        } else {
            // Fallback: just above the footer.
            var footer = document.querySelector('footer');
            if (footer && footer.parentNode) {
                footer.parentNode.insertBefore(node, footer);
            } else {
                document.body.appendChild(node);
            }
        }
        bind(node);
    }

    function init() {
        var meta = document.querySelector('meta[name="edit-url"]');
        var editUrl = safeUrl(meta ? meta.getAttribute('content') : '');
        fetch('contributors.json', { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (data) { inject(boxHtml(normalise(data), editUrl)); })
            .catch(function () { inject(boxHtml([], editUrl)); }); // the ways to contribute still render
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
