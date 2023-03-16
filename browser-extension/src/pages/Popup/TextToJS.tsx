import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { getPageHTML, getRelevantHTML } from '../../helpers/getHTML';
import prettier from 'prettier/standalone';
import parserHTML from 'prettier/parser-html';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { encoding_for_model } from '@dqbd/tiktoken';
import { requestSimplifiedDom } from '../../helpers/simplifyDom';

const enc = encoding_for_model('gpt-3.5-turbo');

const TextToJS = () => {
  const [instructionsContent, setInstructionsContent] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [relevantHTML, setRelevantHTML] = React.useState('');
  const relevantHTMLNumTokens = useMemo(
    () => enc.encode(relevantHTML).length,
    [relevantHTML]
  );
  const prettyRelevantHTML = useMemo(() => {
    if (!relevantHTML) return '';
    return <PrettyHTML html={relevantHTML} />;
  }, [relevantHTML]);

  const toast = useToast();

  const [pageHTML, setPageHTML] = React.useState('');
  const pageHTMLNumTokens = useMemo(
    () => enc.encode(pageHTML).length,
    [pageHTML]
  );
  const prettyPageHTML = useMemo(() => {
    if (!pageHTML) return '';
    return <PrettyHTML html={pageHTML} />;
  }, [pageHTML]);

  useEffect(() => {
    const loadPageHTML = async () => {
      const pageHTML = await requestSimplifiedDom();
      setPageHTML(pageHTML);
    };
    loadPageHTML();
  }, []);

  const onSubmitInstructions = useCallback(
    async (instructions: string, fullPageHTML: string) => {
      setLoading(true);

      try {
        const relevantHTML = await requestSimplifiedDom();
        setRelevantHTML(relevantHTML);
      } catch (e) {
        console.log(e);
      }

      setLoading(false);
    },
    []
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitInstructions(instructionsContent, pageHTML);
    }
  };

  return (
    <>
      <Textarea
        autoFocus
        noOfLines={2}
        placeholder="Your question"
        value={instructionsContent}
        onChange={(e) => setInstructionsContent(e.target.value)}
        mb={2}
        ref={textareaRef}
        onKeyDown={onKeyDown}
      />
      <Button
        leftIcon={loading ? <Spinner /> : <ChatIcon />}
        onClick={() => onSubmitInstructions(instructionsContent, pageHTML)}
        colorScheme="blue"
        disabled={loading || !instructionsContent || !pageHTML}
        mb={4}
      >
        Submit Instructions
      </Button>
      <Accordion allowToggle>
        {/* Relevant HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Relevant HTML
                </Box>
                <CopyIcon
                  onClick={(event) => {
                    event.preventDefault();
                    if (relevantHTML) {
                      navigator.clipboard.writeText(relevantHTML);
                      toast({
                        title: 'Copied to clipboard',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                />
                {relevantHTMLNumTokens > 0 && (
                  <Text as="span" fontSize="sm" color="gray.500">
                    {relevantHTMLNumTokens} tokens
                  </Text>
                )}
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {prettyRelevantHTML && (
              <Box css={{ p: { marginBottom: '1em' } }}>
                {prettyRelevantHTML}
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
        {/* Full Page HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Full Page HTML
                </Box>
                <CopyIcon
                  onClick={(event) => {
                    event.preventDefault();
                    if (pageHTML) {
                      navigator.clipboard.writeText(pageHTML);
                      toast({
                        title: 'Copied to clipboard',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                />
                {pageHTMLNumTokens > 0 && (
                  <Text as="span" fontSize="sm" color="gray.500">
                    {pageHTMLNumTokens} tokens
                  </Text>
                )}
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {prettyPageHTML && (
              <Box css={{ p: { marginBottom: '1em' } }}>{prettyPageHTML}</Box>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

const PrettyHTML = ({ html }: { html: string }) => {
  const formattedHTML = prettier.format(html, {
    parser: 'html',
    plugins: [parserHTML],
    htmlWhitespaceSensitivity: 'ignore',
  });
  return (
    <SyntaxHighlighter language="htmlbars" customStyle={{ fontSize: 12 }}>
      {formattedHTML}
    </SyntaxHighlighter>
  );
};

export default TextToJS;
