export default function init(el) {
  const ul = document.createElement('ul');
  [...el.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-feature-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture, img')) {
        div.className = 'cards-feature-card-image';
      } else {
        div.className = 'cards-feature-card-body';
        // promote a trailing link paragraph to a CTA
        const lastPara = div.querySelector(':scope > p:last-of-type');
        if (lastPara && lastPara.querySelector('a')) {
          lastPara.classList.add('cards-feature-card-cta');
        }
      }
    });
    ul.append(li);
  });
  el.textContent = '';
  el.append(ul);
}
