export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // alternate feature tile columns for visual variety
  if (block.classList.contains('columns-2-cols') && block.querySelector('.columns-img-col')) {
    const featureCols = document.querySelectorAll('main .columns.columns-2-cols');
    const idx = [...featureCols].indexOf(block);
    if (idx >= 0 && idx % 2 === 0) {
      block.classList.add('columns-text-first');
    }
  }
}
