// TypeScript function
function scrollIntoViewFunction() {
  // @ts-ignore
  this.scrollIntoView({
    block: 'center',
    inline: 'center',
    // behavior: 'smooth',
  });
}
// Convert the TypeScript function to a string
export const scrollScriptString = scrollIntoViewFunction.toString();
