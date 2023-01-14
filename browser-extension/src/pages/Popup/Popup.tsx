import React from 'react';
import performSearch from './getPageContent';
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
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import { useAsync } from 'react-use';
import getPageContent from './getPageContent';

const Popup = () => {
  const [searchResults, setSearchResults] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSearch = async () => {
    setLoading(true);
    // setSearchResults(await performSearch(searchQuery, pageContent));
    setLoading(false);
  };

  const pageContent = useAsync(getPageContent, []);

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
          noOfLines={2}
          placeholder="Your question"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb={2}
        />
        <Button
          leftIcon={loading ? <Spinner /> : <ChatIcon />}
          onClick={onSearch}
          colorScheme="blue"
          disabled={loading}
        >
          Ask Leo
        </Button>
        {searchResults.split('\n').map((line, i) => (
          <Text key={i} mb="4">
            {line}
          </Text>
        ))}
        <Accordion allowToggle>
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
              {pageContent.value?.textContent.split('\n').map((line, i) => (
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
