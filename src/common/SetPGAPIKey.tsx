import { Button, Input, VStack, Text, Link, HStack } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';

const ModelDropdown = () => {
  const { updateSettings } = useAppState((state) => ({
    updateSettings: state.settings.actions.update,
  }));

  // State for both OpenAI and PG API keys
  const [openAIKey, setOpenAIKey] = React.useState('');
  const [PGKey, setPGKey] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <VStack spacing={4}>
      <Text fontSize="sm">
        You'll need an OpenAI API Key and optionally a PG API Key to run Taxy in developer mode and check for injections. If you don't already have these keys, you can create them by visiting the respective accounts.
      </Text>
      <Link href="https://platform.openai.com/account/api-keys" color="blue" isExternal>
        Get OpenAI API Key
      </Link>
      <Link href="https://www.predictionguard.com/getting-started" color="blue" isExternal>
        Get PG API Key
      </Link>
      <HStack w="full">
        <Input
          placeholder="OpenAI API Key"
          value={openAIKey}
          onChange={(event) => setOpenAIKey(event.target.value)}
          type={showPassword ? 'text' : 'password'}
        />
      </HStack>
      <HStack w="full">
        <Input
          placeholder="PG API Key (Optional)"
          value={PGKey}
          onChange={(event) => setPGKey(event.target.value)}
          type={showPassword ? 'text' : 'password'}
        />
        <Button
          onClick={() => setShowPassword(!showPassword)}
          variant="outline"
        >
          {showPassword ? 'Hide' : 'Show'}
        </Button>
      </HStack>
      <Button
        onClick={() => updateSettings({ openAIKey, PGKey })} 
        w="full"
        disabled={!openAIKey && !PGKey} 
        colorScheme="blue"
      >
        Save Keys
      </Button>
    </VStack>
  );
};

export default ModelDropdown;
