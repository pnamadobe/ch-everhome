export default function init(el) {
  const cols = [...el.firstElementChild.children];
  el.classList.add(`columns-feature-${cols.length}-cols`);

  // setup image columns
  [...el.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-feature-img-col');
        }
      }
    });
  });
}
