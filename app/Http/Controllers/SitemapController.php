<?php

namespace App\Http\Controllers;

use App\Services\NavigationParser;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Developer pages that exist on disk but nothing links to; kept out of the sitemap.
     */
    private const DEVELOPER_EXCLUDE = ['docs-landing.html', 'hexagon.html'];

    public function __construct(protected NavigationParser $navigation)
    {
    }

    /**
     * /sitemap.xml, built from the site's own data on each request: the merchant navigation and the
     * developer and the-core HTML files. robots.txt has always pointed here, but production never had a
     * file, so the search crawler never found the merchant docs.
     */
    public function index(): Response
    {
        $paths = ['/', '/merchant', '/contributors'];

        foreach ($this->navigation->getCategories() as $category) {
            $paths[] = '/merchant/' . $category['slug'];
            foreach ($category['articles'] as $article) {
                $paths[] = '/merchant/' . $article['path'];
            }
        }

        foreach (glob(public_path('developer/*.html')) ?: [] as $file) {
            $name = basename($file);
            if (!in_array($name, self::DEVELOPER_EXCLUDE, true)) {
                $paths[] = $name === 'index.html' ? '/developer/' : '/developer/' . $name;
            }
        }

        $core = public_path('the-core');
        if (is_dir($core)) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($core, \FilesystemIterator::SKIP_DOTS)
            );
            foreach ($files as $file) {
                if ($file->getExtension() === 'html') {
                    $relative = str_replace('\\', '/', substr($file->getPathname(), strlen($core)));
                    $paths[] = '/the-core' . preg_replace('#/index\.html$#', '/', $relative);
                }
            }
        }

        $paths = array_values(array_unique($paths));
        sort($paths);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        // url() trims trailing slashes ("/developer/" would become a 301 to itself), so join host and path here.
        $root = rtrim(url('/'), '/');
        foreach ($paths as $path) {
            $xml .= '  <url><loc>' . htmlspecialchars($root . $path, ENT_XML1) . '</loc></url>' . "\n";
        }
        $xml .= '</urlset>' . "\n";

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
