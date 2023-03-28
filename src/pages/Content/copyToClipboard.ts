// copy provided text to clipboard
export async function copyToClipboard(text: string) {
    console.log('text to copy', text);
  await navigator.clipboard.writeText(text);
}
