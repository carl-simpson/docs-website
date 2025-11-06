@extends('partials.layout')

@section('content')
<div class="relative bg-white">
    <div class="mx-auto max-w-[1440px] px-6 lg:px-8">
        <div class="flex py-8">
            {{-- Left Sidebar: Category Articles --}}
            <aside class="hidden lg:block w-[400px] flex-shrink-0 pr-8 lg:pr-12">
                <div class="sticky top-24">
                    {{-- Category Header --}}
                    <div class="mb-6">
                        <h3 class="text-sm font-semibold text-orange uppercase tracking-wider mb-4">
                            {{ ucwords(str_replace('-', ' ', $category)) }}
                        </h3>
                    </div>

                    {{-- Category Articles Navigation --}}
                    <nav class="space-y-1" aria-label="Category navigation">
                        @foreach($categoryArticles as $article)
                            <a
                                href="/merchant/{{ $article['path'] }}"
                                class="group flex items-start gap-3 px-3 py-2 text-sm transition-colors duration-150 no-underline border-l-2 rounded-r
                                    {{ $article['slug'] === $page
                                        ? 'bg-yellow border-orange text-charcoal font-semibold shadow-sm'
                                        : 'border-transparent text-gray-700 hover:bg-off-white hover:border-gray-300 hover:text-charcoal' }}"
                            >
                                <span class="flex-1">{{ $article['title'] }}</span>
                                @if($article['slug'] === $page)
                                    <svg class="w-5 h-5 text-orange flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                @endif
                            </a>
                        @endforeach
                    </nav>

                    {{-- View All in Category --}}
                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <a
                            href="/merchant/{{ $category }}"
                            class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors no-underline"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                            View all in category
                        </a>
                    </div>
                </div>
            </aside>

            {{-- Main Content Area --}}
            <main class="flex-1 min-w-0">
                {{-- Documentation Content --}}
                <article class="docs-content max-w-none">
                    {!! $content !!}
                </article>

                {{-- Edit Link Footer --}}
                <div class="mt-12 pt-8 border-t border-gray-200">
                    <a
                        href="{{ $edit_link }}"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit this page on GitHub
                    </a>
                </div>
            </main>

            {{-- Right Sidebar: Table of Contents --}}
            @if(count($tableOfContents) > 0)
            <aside class="hidden xl:block w-64 flex-shrink-0 pl-8">
                <div class="sticky top-24">
                    <div class="mb-4">
                        <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            On this page
                        </h3>
                    </div>

                    <nav class="space-y-2" aria-label="Table of contents">
                        @foreach($tableOfContents as $heading)
                            <a
                                href="#{{ $heading['slug'] }}"
                                class="block text-sm transition-colors duration-150 no-underline
                                    {{ $heading['level'] === 2 ? 'font-medium text-gray-700 hover:text-orange-600' : 'pl-4 text-gray-600 hover:text-gray-900' }}"
                            >
                                {{ $heading['text'] }}
                            </a>
                        @endforeach
                    </nav>

                    {{-- Back to Top --}}
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <a
                            href="#"
                            class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors no-underline"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                            Back to top
                        </a>
                    </div>
                </div>
            </aside>
            @endif
        </div>
    </div>
</div>

{{-- No duplicate mobile menu here - mobile menu is in main-header.blade.php --}}
@endsection
