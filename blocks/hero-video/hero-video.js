function setBackgroundFocus(img) {
  const { title } = img.dataset;
  if (!title?.includes('data-focal')) return;
  delete img.dataset.title;
  const [x, y] = title.split(':')[1].split(',');
  img.style.objectPosition = `${x}% ${y}%`;
}

function buildVideoToggle(video, container) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hero-video-toggle';
  btn.setAttribute('aria-label', 'Pause background video');

  const setState = (playing) => {
    btn.classList.toggle('is-playing', playing);
    btn.classList.toggle('is-paused', !playing);
    btn.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
  };

  btn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      setState(true);
    } else {
      video.pause();
      setState(false);
    }
  });

  setState(!video.paused);
  container.append(btn);
  return { btn, setState };
}

function decorateBackground(bg) {
  const bgPic = bg.querySelector('picture');
  const vidLink = bg.querySelector('a[href*=".mp4"]');

  if (bgPic) {
    const img = bgPic.querySelector('img');
    if (img) setBackgroundFocus(img);
  }

  if (!vidLink) return;
  const video = document.createElement('video');
  video.src = vidLink.href;
  video.loop = true;
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'none');
  video.load();
  const { setState } = buildVideoToggle(video, bg);
  video.addEventListener('canplay', () => {
    video.play();
    setState(true);
    if (bgPic) bgPic.remove();
  });
  vidLink.parentElement.append(video);
  if (bgPic) vidLink.parentElement.append(bgPic);
  vidLink.remove();
}

function decorateLogoTag(fg) {
  // A logo-only foreground (an image with no heading/text) renders as a white
  // tag pinned to the upper-left corner, matching the source brand hero banner.
  const img = fg.querySelector('img');
  if (!img) return false;
  const hasText = fg.querySelector('h1, h2, h3, h4, h5, h6, p, ul');
  if (hasText) return false;

  const tag = document.createElement('div');
  tag.className = 'hero-video-logo';
  tag.append(img);
  fg.prepend(tag);
  fg.classList.add('has-logo-tag');
  return true;
}

function decorateForeground(fg) {
  if (decorateLogoTag(fg)) return;
  const { children } = fg;
  for (const [idx, child] of [...children].entries()) {
    const heading = child.querySelector('h1, h2, h3, h4, h5, h6');
    const text = heading || child.querySelector('p, a, ul');
    if (heading) {
      heading.classList.add('hero-video-heading');
      const detail = heading.previousElementSibling;
      if (detail) {
        detail.classList.add('hero-video-detail');
      }
    }
    if (text) {
      child.classList.add('fg-text');
      if (idx === 0) {
        child.closest('.hero-video').classList.add('hero-video-text-start');
      } else {
        child.closest('.hero-video').classList.add('hero-video-text-end');
      }
    }
  }
}

export default async function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const fg = rows.pop();
  fg.classList.add('hero-video-foreground');
  decorateForeground(fg);
  if (rows.length) {
    const bg = rows.pop();
    bg.classList.add('hero-video-background');
    decorateBackground(bg);
  }
}
