import { loadStyle, getConfig } from '../ak.js';
import ENV from './env.js';

const { codeBase } = getConfig();

// Universal Editor authoring hosts (DA Author Bus).
const IS_UE = /(^|\.)(stage-ue|ue)\.da\.live$/.test(window.location.hostname);

export default async function error(ex, el) {
  // eslint-disable-next-line no-console
  console.log(ex);
  // The header and footer are nav chrome loaded from fragments and are not
  // editable in the Universal Editor; don't clutter the authoring canvas with
  // dev error overlays there. (The error still logs to the console above.)
  if (IS_UE && el?.closest('header, footer')) return;
  if (el && ENV !== 'prod') {
    await loadStyle(`${codeBase}/styles/error.css`);
    const wrapper = document.createElement('div');
    wrapper.className = 'has-error';

    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = 'Error';
    el.insertAdjacentElement('afterend', wrapper);
    wrapper.append(title, el);
  }
}
