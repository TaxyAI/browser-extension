import { CheckIcon } from '@chakra-ui/icons';
import { Button, Input, Link, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { useSyncStorage } from '../state';

const SetKey = () => {
  const [openAIKey, setOpenAIKey] = useSyncStorage('openai-key');

  const [candidateKey, setCandidateKey] = React.useState(openAIKey || '');

  return (
    <Stack spacing={4}>
      <Text>
        To use WebAgent, you'll need to enter your OpenAI API key. This is saved
        in Chrome storage, not on our servers. Once you have an OpenAI account
        you can create a key{' '}
        <Link href="https://beta.openai.com/account/api-keys" color="teal.500">
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
          setOpenAIKey(candidateKey);
        }}
        leftIcon={<CheckIcon />}
        colorScheme="teal"
        disabled={!candidateKey}
      >
        Save
      </Button>
    </Stack>
  );
};

export default SetKey;
