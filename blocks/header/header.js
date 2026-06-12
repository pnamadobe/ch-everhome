import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const { locale } = getConfig();

const HEADER_PATH = '/fragments/nav/header';
const DESKTOP = window.matchMedia('(width >= 900px)');

// In local preview (aem up --html-folder content) the content tree is served
// under /content; in production it lives at the root. Prefix accordingly so the
// fragment fetch resolves to local content instead of proxying the remote site.
const CONTENT_PREFIX = window.location.pathname.startsWith('/content/') ? '/content' : '';

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const openMenu of openMenus) openMenu.classList.remove('is-open');
}

function docClose(e) {
  if (e.target.closest('header .is-open')) return;
  closeAllMenus();
}

function toggleMenu(menu) {
  const isOpen = menu.classList.contains('is-open');
  closeAllMenus();
  if (isOpen) {
    document.removeEventListener('click', docClose);
    return;
  }
  document.addEventListener('click', docClose);
  menu.classList.add('is-open');
}

function decorateLocale(section) {
  section.classList.add('locale-section');
  const link = section.querySelector('p > a[href*="/tools/widgets/language"]');
  if (!link) return;

  const btn = document.createElement('button');
  btn.className = 'locale-trigger';
  btn.setAttribute('aria-label', 'Language Selector - United States - English');
  while (link.firstChild) btn.append(link.firstChild);
  link.replaceWith(btn);

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    let menu = section.querySelector('.locale-menu');
    if (!menu) {
      const fragment = await loadFragment(`${CONTENT_PREFIX}${locale.prefix}${HEADER_PATH}/languages`);
      menu = document.createElement('div');
      menu.className = 'locale-menu';
      menu.append(fragment);
      section.querySelector('p').append(menu);
    }
    toggleMenu(section);
  });
}

function decorateBrand(section) {
  section.classList.add('brand-section');
}

function decorateNavItem(li) {
  li.classList.add('main-nav-item');
  const link = li.querySelector(':scope > p > a');
  if (link) link.classList.add('main-nav-link');
  const submenu = li.querySelector(':scope > ul');
  if (!submenu) return;

  li.classList.add('has-dropdown');
  submenu.classList.add('nav-dropdown');
  if (link) {
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = li.classList.contains('is-open');
      toggleMenu(li);
      link.setAttribute('aria-expanded', String(!wasOpen));
    });
  }
}

function decorateNav(section) {
  section.classList.add('main-nav-section');
  const navList = section.querySelector('ul');
  if (!navList) return;
  navList.classList.add('main-nav-list');

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Header Main Navigation');
  navList.replaceWith(nav);
  nav.append(navList);

  for (const navItem of navList.querySelectorAll(':scope > li')) {
    decorateNavItem(navItem);
  }
}

function decorateUtilityLinks(section) {
  // The first utility section holds the right-side utility links list.
  section.classList.add('utility-links-section');
}

function decorateActions(section) {
  section.classList.add('actions-section');
  const links = section.querySelectorAll('p > a');
  const signin = links[links.length - 1];
  if (signin && !signin.querySelector('img')) signin.classList.add('signin-btn');
}

// Non-functional hotel search bar that mirrors the source site's booking
// widget. It sits between the header and the hero (top of <main>).
function buildBookingBar() {
  const fields = [
    { label: 'Country/State', value: 'Select', placeholder: true, loading: true },
    { label: 'City', value: 'Select', placeholder: true, loading: true },
    { label: 'Check in', value: 'Fri, Jun 12' },
    { label: 'Check out', value: 'Sat, Jun 13' },
    { label: 'Rooms & guests', value: '1 room, 1 guest' },
    { label: 'Rate', value: 'Best Available' },
  ];

  const bar = document.createElement('div');
  bar.className = 'booking-bar';

  const form = document.createElement('div');
  form.className = 'booking-bar-form';
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', 'Search Hotels');

  fields.forEach((field) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'booking-field';
    if (field.placeholder) btn.classList.add('is-placeholder');
    btn.setAttribute('aria-label', `${field.label}: ${field.value}`);

    const label = document.createElement('span');
    label.className = 'booking-field-label';
    label.textContent = field.label;

    const value = document.createElement('span');
    value.className = 'booking-field-value';
    value.textContent = field.value;

    btn.append(label, value);
    if (field.loading) {
      const spinner = document.createElement('span');
      spinner.className = 'booking-field-spinner';
      btn.append(spinner);
    }
    form.append(btn);
  });

  const search = document.createElement('button');
  search.type = 'button';
  search.className = 'booking-search';
  search.innerHTML = '<span class="booking-search-icon"></span><span>Search</span>';
  form.append(search);

  bar.append(form);
  return bar;
}

function buildMobileToggle(header) {
  const toggle = document.createElement('button');
  toggle.className = 'nav-hamburger';
  toggle.setAttribute('aria-label', 'Open navigation menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span class="nav-hamburger-icon"></span>';
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('is-mobile-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('nav-mobile-locked', open);
  });
  return toggle;
}

function handleViewportChange(header, toggle) {
  if (DESKTOP.matches) {
    header.classList.remove('is-mobile-open');
    document.body.classList.remove('nav-mobile-locked');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
    }
  }
  closeAllMenus();
}

async function decorateHeader(fragment) {
  const sections = fragment.querySelectorAll(':scope > .section');
  // 4 sections: utility(0), brand(1), nav(2), actions(3)
  if (sections[0]) {
    decorateLocale(sections[0]);
    decorateUtilityLinks(sections[0]);
  }
  if (sections[1]) decorateBrand(sections[1]);
  if (sections[2]) decorateNav(sections[2]);
  if (sections[3]) decorateActions(sections[3]);
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
export default async function init(el) {
  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;
  try {
    const fragment = await loadFragment(`${CONTENT_PREFIX}${locale.prefix}${path}`);
    fragment.classList.add('header-content');
    await decorateHeader(fragment);

    const toggle = buildMobileToggle(el);
    el.append(toggle);
    el.append(fragment);

    // Inject the (decorative) hotel search bar at the top of the page content.
    const main = document.querySelector('main');
    if (main && !main.querySelector('.booking-bar')) {
      main.prepend(buildBookingBar());
    }

    DESKTOP.addEventListener('change', () => handleViewportChange(el, toggle));
  } catch (e) {
    throw Error(e);
  }
}
