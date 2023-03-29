import React from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import { useToast } from '@chakra-ui/react';
import { callRPC } from '../helpers/pageRPC';

export default function CopyButton(props: { text: string }) {
  const toast = useToast();

  return (
    <CopyIcon
      cursor="pointer"
      color="gray.500"
      _hover={{ color: 'gray.700' }}
      onClick={async (event) => {
        try {
          event.preventDefault();
          await callRPC('copyToClipboard', [props.text]);
          toast({
            title: 'Copied to clipboard',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } catch (e) {
          console.error(e);
          toast({
            title: 'Error',
            description: 'Could not copy to clipboard',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }}
    />
  );
}
