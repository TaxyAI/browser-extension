import React, { useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Text,
  Heading,
  Button,
  Spinner,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
  AccordionButton,
  Alert,
  AlertIcon,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { ChatIcon, CopyIcon } from '@chakra-ui/icons';
import { useAsync } from 'react-use';
import getPageContent from './getPageContent';
import Markdown from 'marked-react';
import { formatPrompt, performQuery } from './performQuery';

const QA = () => {
  const [queryResults, setQueryResults] = React.useState<{
    content: string;
    type: 'error' | 'success';
  } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = React.useState(false);

  const toast = useToast();

  const onSearch = async () => {
    if (!pageContent.value || !searchQuery) return;
    setLoading(true);
    try {
      const results = await performQuery(searchQuery, pageContent.value);
      if (results) {
        setQueryResults({ content: results, type: 'success' });
      } else {
        setQueryResults({
          content: 'No results found. Please try a different question.',
          type: 'error',
        });
      }
    } catch (error: any) {
      setQueryResults({ content: error.message, type: 'error' });
    }

    setLoading(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSearch();
    }
  };

  const pageContent = useAsync(
    () => getPageContent().catch((e) => console.log(e)),
    []
  );

  const formattedPrompt = useMemo(() => {
    if (!pageContent.value) return '';
    return formatPrompt(searchQuery, pageContent.value);
  }, [pageContent.value, searchQuery]);

  useEffect(() => {
    setQueryResults(null);
  }, [searchQuery]);

  const formattedQueryResults = useMemo(() => {
    if (!queryResults) return null;

    const alertStatus = queryResults.type;

    return (
      <Alert status={alertStatus} mb={4}>
        <AlertIcon />
        <Box mb={-4}>
          {queryResults?.content.split('\n').map((line, i) => (
            <Text key={i} mb="4">
              {line}
            </Text>
          ))}
        </Box>
      </Alert>
    );
  }, [queryResults]);

  return (
    <>
      <Textarea
        autoFocus
        noOfLines={2}
        placeholder="Your question"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb={2}
        ref={textareaRef}
        onKeyDown={onKeyDown}
      />
      <Button
        leftIcon={loading ? <Spinner /> : <ChatIcon />}
        onClick={onSearch}
        colorScheme="blue"
        disabled={loading || !searchQuery || !pageContent.value}
        mb={4}
      >
        Ask Leo
      </Button>
      {formattedQueryResults}
      <Accordion allowToggle>
        {/* Page content */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Detected Page Content
                </Box>
                <Button>
                  <CopyIcon
                    onClick={(event) => {
                      event.preventDefault();
                      if (pageContent.value?.markdown) {
                        navigator.clipboard.writeText(
                          pageContent.value.markdown
                        );
                        toast({
                          title: 'Copied to clipboard',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                  />
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

        {/* Prompt */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Derived Prompt
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4}>
            {formattedPrompt.split('\n').map((line, i) => (
              <Text key={i} mb="4">
                {line}
              </Text>
            ))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default QA;
