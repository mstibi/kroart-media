import assert from 'node:assert/strict';
import { test } from 'node:test';
import { watchTikTok } from '../src/scripts/tiktok-player.ts';

test('TikTok errors, message validation, retry, timeout and cleanup', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  class Element extends EventTarget {
    children = [];
    hidden = false;
    classList = { remove() {} };
    setAttribute() {}
    append(...children) { this.children.push(...children); }
  }
  globalThis.document = { createElement: () => new Element() };
  globalThis.window = new EventTarget();
  const frame = new Element();
  frame.contentWindow = {};
  frame.src = 'https://www.tiktok.com/player/v1/123';
  const wrap = new Element();
  const stop = watchTikTok(frame, wrap, 'https://www.tiktok.com/@test/video/123');
  const panel = wrap.children[0];
  const send = (data, origin = 'https://www.tiktok.com', source = frame.contentWindow) => {
    const event = new Event('message');
    Object.assign(event, { data, origin, source });
    window.dispatchEvent(event);
  };
  const error = { 'x-tiktok-player': true, type: 'onPlayerError', value: { errorCode: 3001 } };
  send(error, 'https://example.com');
  send(error, undefined, {});
  send(null);
  assert.equal(panel.hidden, true, 'ignore foreign or malformed messages');
  send({ 'x-tiktok-player': true, type: 'onPlayerReady' });
  t.mock.timers.tick(20000);
  assert.equal(panel.hidden, true, 'ready player must not time out while waiting for Play');
  send({ ...error, value: { errorCode: 3002 } });
  assert.equal(panel.hidden, true, 'autoplay denial leaves manual controls available');
  send(error);
  assert.equal(panel.hidden, false);
  assert.equal(frame.hidden, true);
  panel.children[1].dispatchEvent(new Event('click'));
  assert.equal(panel.hidden, true);
  assert.equal(frame.hidden, false);
  t.mock.timers.tick(20000);
  assert.equal(panel.hidden, false, 'unresponsive player shows fallback');
  panel.children[1].dispatchEvent(new Event('click'));
  stop();
  send(error);
  t.mock.timers.tick(20000);
  assert.equal(panel.hidden, true, 'closing or navigating removes listeners and timer');
  delete globalThis.document;
  delete globalThis.window;
});
