import { Box, ChakraProvider, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';
import ModelDropdown from './ModelDropdown';
import SetAPIKey from './SetAPIKey';
import TaskUI from './TaskUI';
import logo from '../assets/img/icon-128.png';
import * as amplitude from '@amplitude/analytics-browser';

amplitude.init("ea8b57294ba085baafd55cc783db1d4a");

const App = () => {
  const openAIKey = useAppState((state) => state.settings.openAIKey);

  return (
    <ChakraProvider>
      <Box fontSize="lg" w="full">
        <HStack mb={4} px={8} pt={8} alignItems="center">
          <img
            src={logo}
            width={32}
            height={32}
            className="App-logo"
            alt="logo"
          />

          <Heading as="h1" size="lg" flex={1}>
            Taxy AI
          </Heading>
          <Box>
            <ModelDropdown />
          </Box>
        </HStack>
        {openAIKey ? <TaskUI /> : <SetAPIKey />}
      </Box>
    </ChakraProvider>
  );
};

export default App;
