import { getValueFromStorage, SELECTED_OPENAI_MODEL } from '../state';

export const countTokens = async (text: string) => {
  const model = (await getValueFromStorage(
    SELECTED_OPENAI_MODEL,
    'gpt-3.5-turbo'
  )) as string;
  // make a call to https://tiktoken-api.vercel.app/token_count/ to get the token count
  const response = await fetch('https://tiktoken-api.vercel.app/token_count', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_name: model,
      text,
    }),
  });
  const data = await response.json();
  return data.token_count;
};
