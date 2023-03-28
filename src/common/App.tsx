import { Box, ChakraProvider, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';
import ModelDropdown from './ModelDropdown';
import SetKey from './SetKey';
import TaskUI from './TaskUI';
// import logo from '../assets/img/logo.svg';
// import logo from '../assets/img/logo.svg';
import logo from '../assets/img/icon-128.png';

const App = ({ showIntro }: { showIntro?: boolean }) => {
  const openAIKey = useAppState((state) => state.settings.openAIKey);

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
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
        {openAIKey ? <TaskUI /> : <SetKey />}
      </Box>
    </ChakraProvider>
  );
};

export default App;
