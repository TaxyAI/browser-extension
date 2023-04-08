import { Button, Input, VStack, Text, Link, HStack } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';

const ModelDropdown = () => {
  const { updateSettings } = useAppState((state) => ({
    updateSettings: state.settings.actions.update,
  }));

  const [openAIKey, setOpenAIKey] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <VStack spacing={4}>
      <Text fontSize="sm">
        You'll need an OpenAI API Key to run the Taxy in developer mode. If you
        don't already have one available, you can create one in your{' '}
        <Link
          href="https://platform.openai.com/account/api-keys"
          color="blue"
          isExternal
        >
          OpenAI account
        </Link>
        .
        <br />
        <br />
        Taxy stores your API key locally and securely, and it is only used to
        communicate with the OpenAI API.
      </Text>
      <HStack w="full">
        <Input
          placeholder="OpenAI API Key"
          value={openAIKey}
          onChange={(event) => setOpenAIKey(event.target.value)}
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
        onClick={() => updateSettings({ openAIKey })}
        w="full"
        disabled={!openAIKey}
        colorScheme="blue"
      >
        Save Key
      </Button>
    </VStack>
  );
};

export default ModelDropdown;
