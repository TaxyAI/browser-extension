import { Box, Text, ChakraProvider, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import { useSyncStorage } from '../state';
import ModelDropdown from './ModelDropdown';
import SetKey from './SetKey';
import TaskUI from './TaskUI';

const App = ({ showIntro }: { showIntro?: boolean }) => {
  const [openAIKey] = useSyncStorage('openai-key');

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" mb={4} flex={1}>
            WebAgent
          </Heading>
          <Box flex={1}>
            <ModelDropdown />
          </Box>
        </HStack>
        {showIntro && (
          <Text fontSize="lg" mb="4">
            WebAgent uses OpenAI's GPT-3 API to generate code from instructions
            and executes it in your browser. Try telling it to click a button,
            or to add a new div to the page.
          </Text>
        )}
        {openAIKey ? <TaskUI /> : <SetKey />}
      </Box>
    </ChakraProvider>
  );
};

export default App;
