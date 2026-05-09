import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

function extractBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

export function loadLegacyBody(pathFromRoot: string): string {
  const html = readFileSync(resolve(ROOT, pathFromRoot), "utf-8");
  return extractBody(html)
    .replace(/href="projects\/([a-z-]+)\.html"/g, "href=\"/projects/$1\"")
    .replace(/href="\.\.\/index\.html(#.*?)?"/g, "href=\"/$1\"")
    .replace(/href="([a-z-]+)\.html"/g, "href=\"/projects/$1\"")
    .replace(/src="\.\.\/js\/main\.js"/g, 'src="/js/main.js"')
    .replace(/src="js\/main\.js"/g, 'src="/js/main.js"')
    .replace(/onclick="toggleFolder\(this\)"/g, "data-folder-toggle")
    .replace(/onclick="\s*event\.preventDefault\(\);\s*window\.open\('([^']+)'[^\"]*\"/g, 'data-run-url="$1"')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/window\.location\.href\s*=\s*"\.\.\/index\.html"/g, 'window.location.href = "/"')
    .replace(/window\.location\.href\s*=\s*"([a-z-]+)\.html"/g, 'window.location.href = "/projects/$1"');
}
