import React from 'react';
import { Text } from '@chakra-ui/react';
import { countTokens } from '../helpers/countTokens';
import { useAsync } from 'react-use';
import { useAppState } from '../state/store';

const TokenCount = ({ html }: { html: string }) => {
  const selectedModel = useAppState((state) => state.settings.selectedModel);

  const numTokens =
    useAsync(
      () => countTokens(html, selectedModel as string),
      [html, selectedModel]
    ).value || null;

  let displayedCount = null;
  if (!html) {
    displayedCount = 'Waiting for HTML';
  } else if (numTokens === null) {
    displayedCount = 'Counting...';
  } else {
    displayedCount = numTokens + ' tokens';
  }

  return (
    <>
      <Text as="span" fontSize="sm" color="gray.500">
        {displayedCount}
      </Text>
    </>
  );
};

export default TokenCount;
