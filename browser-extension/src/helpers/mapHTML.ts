export const mapHTML = (html: string) => {
  return html
    .replaceAll('<div', '<d')
    .replaceAll('</div>', '</d>')
    .replaceAll('<span', '<s')
    .replaceAll('</span>', '</s>')
    .replaceAll('<button', '<b')
    .replaceAll('</button>', '</b>')
    .replaceAll('aria-label', 'a-l');
};
