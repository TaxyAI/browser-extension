import { Box, ChakraProvider, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { useSyncStorage } from '../../state';
import SetKey from '../../common/SetKey';
import TextToJS from './TextToJS';

const Popup = () => {
  const [openAIKey] = useSyncStorage('openai-key');

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w={800}>
        <Heading as="h1" size="lg" mb={4}>
          LLM Browser Tools
        </Heading>
        <Text fontSize="lg" mb="4">
          LLM Browser Tools uses OpenAI's GPT-3 API to generate code from
          instructions and executes it in your browser. Try telling it to click
          a button, or to add a new div to the page.
        </Text>
        {openAIKey ? <TextToJS /> : <SetKey />}
      </Box>
    </ChakraProvider>
  );
};

export default Popup;
