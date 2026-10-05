{{--
    Article-page contributor row (Carl, 2026-10-05): restyled in line with the contributor block.
    Avatars only (names stay available to screen readers), linking to our contributors page, and
    "Edit this page on GitHub" as a black button. Uses the same top-10 list as the contributors
    page, so both share one cache entry.
--}}
@props(['editUrl' => ''])

@php
    $contributors = array_slice(app(\App\Services\GitHubContributorsService::class)->getTopContributors(10), 0, 5);
@endphp

<div data-contributor-row class="qbcr mt-16 pt-8 pb-8 border-t border-gray-200 max-w-4xl mx-auto lg:mx-0">
    @if(count($contributors) > 0)
        {{-- One bordered card, wholly a link, like the hub block (Carl, 2026-10-05) --}}
        <div role="region" aria-label="Top Contributors" class="qbcr-people">
            <a href="{{ route('contributors') }}" class="qbcr-card">
                <span class="qbcr-kicker"><i class="qbcr-dot" aria-hidden="true"></i>Written by the community</span>
                <span class="qbcr-line">
                    <span class="qbcr-stack" aria-hidden="true">
                        @foreach($contributors as $contributor)
                            <img src="{{ $contributor['avatar_url'] }}" alt="" width="44" height="44" loading="lazy" />
                        @endforeach
                    </span>
                    <span class="qbcr-text">Meet the contributors</span>
                    <span class="sr-only">: {{ implode(', ', array_column($contributors, 'login')) }}</span>
                    <svg class="qbcr-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-6-6l6 6-6 6"/></svg>
                </span>
            </a>
        </div>
    @endif

    @if($editUrl)
        <a href="{{ $editUrl }}" target="_blank" rel="noopener noreferrer" class="qbcr-edit">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit this page on GitHub<span class="sr-only"> (opens in a new tab)</span>
        </a>
    @endif
</div>

<style>
    /* Scoped (.qbcr): the docs typography styles every `a` and `img`, so this row sets its own. */
    .qbcr { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 20px 24px; }
    .qbcr-people { display: flex; }
    .qbcr a.qbcr-card { display: inline-flex; flex-direction: column; gap: 8px; padding: 12px 16px; background: #fff; border: 1px solid #e5e7eb; /* the row's own top line */ color: #2c2c2c; text-decoration: none; transition: border-color .15s ease; }
    .qbcr a.qbcr-card:hover { border-color: #F26423; color: #2c2c2c; }
    .qbcr a.qbcr-card:focus-visible { outline: 3px solid #F26423; outline-offset: 2px; }
    .qbcr-kicker { display: flex; align-items: center; gap: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; font-weight: 500; letter-spacing: .12em; line-height: 1; text-transform: uppercase; color: #bc3312; }
    .qbcr-dot { display: inline-block; width: 8px; height: 8px; background: #F26423; }
    .qbcr-line { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }
    .qbcr-stack { display: inline-flex; }
    .qbcr-stack img { display: block; width: 44px; height: 44px; max-width: none; box-sizing: border-box; margin: 0; border: 2px solid #fff; outline: 1px solid #e5e7eb; background: #f1f1f1; object-fit: cover; }
    .qbcr-stack img + img { margin-left: -8px; }
    .qbcr-arrow { width: 16px; height: 16px; margin-left: 12px; color: #bc3312; transition: transform .15s ease; }
    .qbcr a.qbcr-card:hover .qbcr-arrow { transform: translateX(3px); }
    @media (prefers-reduced-motion: reduce) { .qbcr a.qbcr-card, .qbcr-arrow { transition: none; } }
    .qbcr a.qbcr-edit { display: inline-flex; align-items: center; gap: 8px; box-sizing: border-box; height: 44px; padding: 0 16px; background: #2c2c2c; border: 2px solid #2c2c2c; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; }
    .qbcr a.qbcr-edit:hover { background: #474747; border-color: #474747; color: #fff; }
    .qbcr a.qbcr-edit:focus-visible { outline: 3px solid #F26423; outline-offset: 2px; }
    .qbcr a.qbcr-edit svg { width: 16px; height: 16px; flex: none; }
</style>
