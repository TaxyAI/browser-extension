import { Box, Text, ChakraProvider, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';
import ModelDropdown from './ModelDropdown';
import SetKey from './SetKey';
import TaskUI from './TaskUI';

const App = ({ showIntro }: { showIntro?: boolean }) => {
  const openAIKey = useAppState((state) => state.settings.openAIKey);

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" flex={1}>
            Taxy AI
          </Heading>
          <Box flex={1}>
            <ModelDropdown />
          </Box>
        </HStack>
        {showIntro && (
          <Text fontSize="lg" mb="4">
            Taxy uses OpenAI's GPT-4 API to perform actions in your browser.
            Try telling it to sign up for a newsletter, or to add an item to
            your cart.
          </Text>
        )}
        {openAIKey ? <TaskUI /> : <SetKey />}
      </Box>
    </ChakraProvider>
  );
};

export default App;
