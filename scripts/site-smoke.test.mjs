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
