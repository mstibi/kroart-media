import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const root = resolve('dist');
const routes = ['/', '/fotografije/', '/videi/', '/vizuali/', '/404.html'];
const fileFor = (path) => resolve(root, `.${path.endsWith('/') ? `${path}index.html` : path}`);
const pages = new Map(routes.map((route) => [route, readFileSync(fileFor(route), 'utf8')]));

for (const [route, html] of pages) {
  test(`${route}: headings, internal links, anchors and local assets`, () => {
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.match(html, /<html[^>]*lang="hr"/);
    assert.doesNotMatch(html, /7518081728536415493|arsa-giveaway/);
    for (const [tag] of html.matchAll(/<(?:a|img|script|video|link)\b[^>]*>/g)) {
      for (const [, attribute, value] of tag.matchAll(/\s(href|src|poster)="([^"]+)"/g)) {
        if (!value.startsWith('/') && !value.startsWith('#')) continue;
        const url = new URL(value, `https://local.test${route}`);
        if (url.origin !== 'https://local.test') continue;
        assert.ok(existsSync(fileFor(url.pathname)), `${route}: missing ${value}`);
        if (attribute === 'href' && url.hash && tag.startsWith('<a ')) {
          const destination = pages.get(url.pathname);
          assert.ok(destination?.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route}: missing anchor ${value}`);
        }
      }
    }
  });
}

test('video gallery contains 20 works and six TikTok embeds', () => {
  const html = pages.get('/videi/');
  assert.equal((html.match(/class="g-item(?: g-ext)?"/g) ?? []).length, 20);
  assert.equal((html.match(/data-platform="TikTok"/g) ?? []).length, 6);
});

test('SEO: sitemap lists every indexable page, each has canonical and share image, 404 is noindex', () => {
  const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
  const listed = [...sitemap.matchAll(/<loc>https:\/\/kroart\.media([^<]*)<\/loc>/g)].map(([, path]) => path);
  assert.deepEqual(listed, routes.filter((r) => r !== '/404.html'));
  assert.match(readFileSync(resolve(root, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/kroart\.media\/sitemap\.xml/);
  for (const route of listed) {
    const html = pages.get(route);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://kroart\.media${route}">`), route);
    assert.match(html, /<meta property="og:image" content="https:\/\/kroart\.media\/og\.jpg">/, route);
  }
  assert.ok(existsSync(resolve(root, 'og.jpg')));
  assert.match(pages.get('/404.html'), /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(pages.get('/404.html'), /rel="canonical"/);
  JSON.parse(pages.get('/').match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
});
