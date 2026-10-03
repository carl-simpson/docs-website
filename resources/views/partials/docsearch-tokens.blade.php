{{-- DocSearch design tokens. Single source: resources/design-tokens/docsearch.json (also read by bin/devdocs/build_docsearch_tokens.py). --}}
@php
    $docsearchTokens = json_decode(file_get_contents(resource_path('design-tokens/docsearch.json')), true, 512, JSON_THROW_ON_ERROR);
@endphp
<style id="docsearch-tokens">
:root {
@foreach ($docsearchTokens['light'] as $name => $value)
    {{ $name }}: {{ $value }};
@endforeach
}
html[data-theme=dark]:root {
@foreach ($docsearchTokens['dark'] as $name => $value)
    {{ $name }}: {{ $value }};
@endforeach
}
</style>
