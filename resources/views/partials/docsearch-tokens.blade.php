{{-- DocSearch design tokens. Single source: resources/design-tokens/docsearch.json (also read by bin/devdocs/build_docsearch_tokens.py).
     Fails closed: a missing or malformed token file renders no style block (DocSearch falls back to its own defaults) and is logged, rather than breaking every page. --}}
@php
    $docsearchTokens = null;
    $docsearchTokenFile = resource_path('design-tokens/docsearch.json');
    try {
        if (! is_file($docsearchTokenFile)) {
            throw new \RuntimeException('file not found');
        }
        $decoded = json_decode(file_get_contents($docsearchTokenFile), true, 512, JSON_THROW_ON_ERROR);
        if (! is_array($decoded['light'] ?? null) || ! is_array($decoded['dark'] ?? null)) {
            throw new \UnexpectedValueException('expected "light" and "dark" token maps');
        }
        // Values are echoed inside <style>, a raw-text element: Blade's escaping would corrupt
        // quotes or ampersands, so anything that needs escaping is rejected instead.
        foreach (['light', 'dark'] as $mode) {
            foreach ($decoded[$mode] as $name => $value) {
                if (! is_string($name) || ! preg_match('/^--[a-z0-9-]+$/', $name)
                    || ! is_string($value) || preg_match('/["\'&<>{};]/', $value)) {
                    throw new \UnexpectedValueException('invalid token ' . $mode . '.' . (is_string($name) ? $name : '?'));
                }
            }
        }
        $docsearchTokens = $decoded;
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::warning('DocSearch design-tokens not rendered: ' . $e->getMessage(), ['file' => $docsearchTokenFile]);
    }
@endphp
@if ($docsearchTokens)
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
@endif
