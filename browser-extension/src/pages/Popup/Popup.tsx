import { Box, ChakraProvider, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import QA from './QA';
import { useSyncStorage } from '../../state';
import SetKey from '../../common/SetKey';

const Popup = () => {
  const [openAIKey] = useSyncStorage('openai-key');

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="xl">
        <Heading as="h1" size="lg" mb={4}>
          Leo GPT Search
        </Heading>
        <Text fontSize="lg" mb="4">
          Leo uses GPT-3 to answer questions about the site you're on. Type in a
          question, and we'll send it along with the text of the current page to
          GPT-3.
        </Text>
        {openAIKey ? <QA /> : <SetKey />}
      </Box>
    </ChakraProvider>
  );
};

export default Popup;
