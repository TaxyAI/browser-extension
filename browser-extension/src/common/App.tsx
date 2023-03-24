import { Box, Text, ChakraProvider, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import { useAppStore } from '../state/store';
import { useSyncStorage } from '../state/syncStorage';
import ModelDropdown from './ModelDropdown';
import SetKey from './SetKey';
import TaskUI from './TaskUI';

const App = ({ showIntro }: { showIntro?: boolean }) => {
  const openAIKey = useAppStore((state) => state.settings.openAIKey);

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" flex={1}>
            WebAgent
          </Heading>
          <Box flex={1}>
            <ModelDropdown />
          </Box>
        </HStack>
        {showIntro && (
          <Text fontSize="lg" mb="4">
            WebAgent uses OpenAI's GPT-4 API to perform actions in your browser.
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
