export const countTokens = async (text: string, model_name: string) => {
  const response = await fetch('https://tiktoken-api.vercel.app/token_count', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_name,
    }),
  });
  const data = await response.json();
  return data.token_count;
};
