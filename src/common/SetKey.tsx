import { CheckIcon } from '@chakra-ui/icons';
import { Button, Input, Link, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';

const SetKey = () => {
  const { openAIKey, updateSettings } = useAppState((state) => ({
    openAIKey: state.settings.openAIKey,
    updateSettings: state.settings.actions.update,
  }));

  const [candidateKey, setCandidateKey] = React.useState(openAIKey || '');

  return (
    <Stack spacing={4}>
      <Text>
        To use Taxy, you'll need to enter your OpenAI API key. This is saved in
        Chrome storage, not on our servers. Once you have an OpenAI account you
        can create a key{' '}
        <Link href="https://beta.openai.com/account/api-keys" color="blue.500">
          here
        </Link>
        .
      </Text>
      <Input
        value={candidateKey}
        placeholder="OpenAI API Key"
        type={'password'}
        onChange={(e) => setCandidateKey(e.target.value)}
      />
      <Button
        onClick={() => {
          updateSettings({ openAIKey: candidateKey });
        }}
        leftIcon={<CheckIcon />}
        colorScheme="blue"
        disabled={!candidateKey}
      >
        Save
      </Button>
    </Stack>
  );
};

export default SetKey;
