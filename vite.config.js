import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: [
                'resources/views/**',
                'routes/**',
                'app/**',
            ],
        }),
        visualizer({
            open: false,
            gzipSize: true,
            brotliSize: true,
            filename: 'storage/app/stats.html',
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor chunks for better caching
                    'alpine': ['alpinejs', '@alpinejs/focus'],
                    'search': ['@docsearch/js'],
                    'mermaid': ['mermaid'],
                },
            },
        },
        // Minification and source maps
        minify: 'terser',
        sourcemap: 'hidden', // Hidden sourcemaps for production debugging without exposing to users
        cssCodeSplit: true,
        // Chunk size warnings
        chunkSizeWarningLimit: 500,
        // Additional optimizations
        // es2017, not es2015: es2015 rewrites async functions, which breaks Alpine's async evaluator
        // ("r.call(...).catch is not a function" on every merchant page). Fixed 2026-10-05.
        target: 'es2017',
        cssMinify: true,
    },
});
