export const tagsSelfClose = (html: string) => {
  // Regular expression to match empty elements
  const re = /<([a-z]+)([^<]*?)><\/\1>/gi;

  // Replace empty elements with self-closing tags
  const newHtml = html.replace(re, '<$1$2 />');
  return newHtml;
};
