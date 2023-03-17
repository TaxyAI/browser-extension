import { ChatIcon, CopyIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import Markdown from 'marked-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useAsync } from 'react-use';
import getPageContent from '../../common/getPageContent';
import { performQuery, RecordedMessage } from './performQuery';

const QA = () => {
  const [messageContent, setMessageContent] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = React.useState(false);

  const [messages, setMessages] = React.useState<RecordedMessage[]>([]);

  const toast = useToast();

  const pageContent = useAsync(
    () => getPageContent().catch((e) => console.log(e)),
    []
  );

  const sendMessages = useCallback(
    async (messages: RecordedMessage[]) => {
      if (!pageContent.value || !messages) return;
      setLoading(true);
      let returnMessage: RecordedMessage = {
        role: 'assistant',
        content: 'Loading...',
        type: 'success',
      };
      try {
        const results = await performQuery(messages, pageContent.value);
        if (results) {
          returnMessage.content = results;
        } else {
          returnMessage.content =
            'No results found. Please try a different question.';
          returnMessage.type = 'error';
        }
      } catch (error: any) {
        returnMessage.content = error.message;
        returnMessage.type = 'error';
      }
      setMessages([...messages, returnMessage]);

      setLoading(false);
    },
    [pageContent.value]
  );

  const onSubmitUserMessage = useCallback(
    (content: string) => {
      const updatedMessages: RecordedMessage[] = [
        ...messages,
        { role: 'user', content, type: 'info' },
      ];
      setMessageContent('');
      setMessages(updatedMessages);
      sendMessages(updatedMessages);
    },
    [messages, sendMessages]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitUserMessage(messageContent);
    }
  };

  const formattedMessages = useMemo(() => {
    return messages.map((message, i) => {
      return (
        <Box>
          <Alert status={message.type} mb={4}>
            <AlertIcon />
            <Box mb={-4}>
              {message.content.split('\n').map((line, i) => (
                <Text key={i} mb="4">
                  {line}
                </Text>
              ))}
            </Box>
          </Alert>
        </Box>
      );
    });
  }, [messages]);

  return (
    <>
      {formattedMessages}
      <Textarea
        autoFocus
        noOfLines={2}
        placeholder="Your question"
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        mb={2}
        ref={textareaRef}
        onKeyDown={onKeyDown}
      />
      <Button
        leftIcon={loading ? <Spinner /> : <ChatIcon />}
        onClick={() => onSubmitUserMessage(messageContent)}
        colorScheme="blue"
        disabled={loading || !messageContent || !pageContent.value}
        mb={4}
      >
        Ask Leo
      </Button>
      <Accordion allowToggle>
        {/* Page content */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Detected Page Content
                </Box>
                <Button
                  onClick={(event) => {
                    event.preventDefault();
                    if (pageContent.value?.markdown) {
                      navigator.clipboard.writeText(pageContent.value.markdown);
                      toast({
                        title: 'Copied to clipboard',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                >
                  <CopyIcon />
                </Button>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4}>
            <HStack>
              <Heading as="h3" size="sm" mb={4}>
                {pageContent.value?.title}
              </Heading>
            </HStack>
            {pageContent.value?.markdown && (
              <Box css={{ p: { marginBottom: '1em' } }}>
                <Markdown>{pageContent.value?.markdown}</Markdown>
              </Box>
            )}
            {pageContent.value?.markdown}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default QA;
