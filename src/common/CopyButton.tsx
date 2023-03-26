import React from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import { useToast } from '@chakra-ui/react';

export default function CopyButton(props: { text: string }) {
  const toast = useToast();

  return (
    <CopyIcon
      cursor="pointer"
      color="gray.500"
      _hover={{ color: 'gray.700' }}
      onClick={(event) => {
        event.preventDefault();
        navigator.clipboard.writeText(props.text);
        toast({
          title: 'Copied to clipboard',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }}
    />
  );
}
