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
import Markdown from 'marked-react';

const TextToJS = () => {
  const [instructionsContent, setInstructionsContent] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [relevantHTML, setRelevantHTML] = React.useState('');

  const toast = useToast();

  const [pageHTML, setPageHTML] = React.useState('');

  useEffect(() => {
    const loadPageHTML = async () => {
      const pageHTML = await getPageHTML();
      setPageHTML(pageHTML);
    };
    loadPageHTML();
  }, []);

  const onSubmitInstructions = useCallback(
    async (instructions: string, fullPageHTML: string) => {
      setLoading(true);

      try {
        const relevantHTML = await getRelevantHTML(instructions, fullPageHTML);
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
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {relevantHTML && (
              <Box css={{ p: { marginBottom: '1em' } }}>
                <Markdown>{relevantHTML}</Markdown>
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
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {pageHTML && (
              <Box css={{ p: { marginBottom: '1em' } }}>
                <Markdown langPrefix="html">{pageHTML}</Markdown>
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default TextToJS;
