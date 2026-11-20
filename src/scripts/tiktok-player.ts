// TikTok can load its iframe successfully and still fail to load the video.
export function watchTikTok(frame: HTMLIFrameElement, wrap: HTMLElement, href: string) {
  const origin = 'https://www.tiktok.com';
  const panel = document.createElement('div');
  panel.className = 'lb-embed-error';
  panel.hidden = true;
  const message = document.createElement('p');
  message.setAttribute('role', 'status');
  message.textContent = 'TikTok trenutačno ne može učitati ovaj video.';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Pokušaj ponovno';
  const link = document.createElement('a');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Pogledaj na TikToku ↗';
  panel.append(message, retry, link);
  wrap.append(panel);

  const fail = () => {
    clearTimeout(timer);
    frame.hidden = true;
    panel.hidden = false;
  };
  let timer = setTimeout(fail, 20000);
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== origin || event.source !== frame.contentWindow || event.data?.['x-tiktok-player'] !== true) return;
    const { type, value } = event.data;
    if (type === 'onPlayerReady' || type === 'onStateChange') clearTimeout(timer);
    if (type === 'onPlayerError' && value?.errorCode !== 3002) fail();
    // Autoplay denial still leaves a usable manual Play button.
  };
  retry.addEventListener('click', () => {
    panel.hidden = true;
    frame.hidden = false;
    frame.classList.remove('is-ready');
    timer = setTimeout(fail, 20000);
    frame.src = frame.src;
  });
  window.addEventListener('message', onMessage);
  frame.addEventListener('error', fail);
  return () => {
    clearTimeout(timer);
    window.removeEventListener('message', onMessage);
    frame.removeEventListener('error', fail);
  };
}
