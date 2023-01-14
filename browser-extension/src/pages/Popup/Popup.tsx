import React, { useEffect, useMemo, useRef } from 'react';
import {
  Box,
  ChakraProvider,
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
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import { useAsync } from 'react-use';
import getPageContent from './getPageContent';
import Markdown from 'marked-react';
import { formatPrompt, performQuery } from './performQuery';

const Popup = () => {
  const [queryResults, setQueryResults] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = React.useState(false);

  const onSearch = async () => {
    if (!pageContent.value || !searchQuery) return;
    setLoading(true);
    setQueryResults(await performQuery(searchQuery, pageContent.value));
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

    const alertStatus = queryResults.includes('Not enough information')
      ? 'error'
      : 'success';

    return (
      <Alert status={alertStatus} mb={4}>
        <AlertIcon />
        <Box mb={-4}>
          {queryResults?.split('\n').map((line, i) => (
            <Text key={i} mb="4">
              {line}
            </Text>
          ))}
        </Box>
      </Alert>
    );
  }, [queryResults]);

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg">
        <Heading as="h1" size="lg" mb={4}>
          Leo GPT Search
        </Heading>
        <Text fontSize="lg" mb="4">
          Leo uses GPT-3 to answer questions about the site you're on. Type in a
          question, and we'll send it along with the text of the current page to
          GPT-3.
        </Text>
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
                <Box as="span" flex="1" textAlign="left">
                  Detected Page Content
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </Heading>
            <AccordionPanel pb={4}>
              <Heading as="h3" size="sm" mb={4}>
                {pageContent.value?.title}
              </Heading>
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
      </Box>
    </ChakraProvider>
  );
};

export default Popup;
