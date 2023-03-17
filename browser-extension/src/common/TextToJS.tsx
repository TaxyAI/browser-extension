import React, { useCallback, useMemo, useRef } from 'react';
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
  useToast,
  HStack,
} from '@chakra-ui/react';
import { ChatIcon, CopyIcon } from '@chakra-ui/icons';
import prettier from 'prettier/standalone';
import parserHTML from 'prettier/parser-html';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { encoding_for_model } from '@dqbd/tiktoken';
import { useAsync } from 'react-use';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { mapHTML } from '../helpers/mapHTML';
import { performQuery } from '../helpers/performQuery';
import ReactSyntaxHighlighter from 'react-syntax-highlighter';

const enc = encoding_for_model('gpt-3.5-turbo');

const TextToJS = () => {
  const [instructionsContent, setInstructionsContent] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = React.useState(false);

  const toast = useToast();

  console.log('hi');
  const simplifiedHTML = useAsync(getSimplifiedDom, []);
  const mappedHTML = useMemo(() => {
    if (!simplifiedHTML.value) return '';
    return mapHTML(simplifiedHTML.value);
  }, [simplifiedHTML]);

  const simplifiedHTMLNumTokens = useMemo(
    () => enc.encode(simplifiedHTML.value ?? '').length,
    [simplifiedHTML]
  );
  const prettySimplifiedHTML = useMemo(
    () => <PrettyHTML html={simplifiedHTML.value ?? ''} />,
    [simplifiedHTML]
  );

  const mappedHTMLNumTokens = useMemo(
    () => enc.encode(mappedHTML).length,
    [mappedHTML]
  );
  const prettyMappedHTML = useMemo(() => {
    if (!mappedHTML) return '';
    return <PrettyHTML html={mappedHTML} />;
  }, [mappedHTML]);

  const [code, setCode] = React.useState('');

  const onSubmitInstructions = useCallback(
    async (instructions: string, mappedHTML: string) => {
      setLoading(true);

      try {
        // Generate code from instructions
        const output = await performQuery(instructions, mappedHTML);
        setCode(output);
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitInstructions(instructionsContent, simplifiedHTML?.value ?? '');
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
        onClick={() =>
          onSubmitInstructions(instructionsContent, simplifiedHTML.value ?? '')
        }
        colorScheme="blue"
        disabled={loading || !instructionsContent || !simplifiedHTML.value}
        mb={4}
      >
        Submit Instructions
      </Button>
      <Accordion allowToggle>
        {/* Generated Code */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Generated Code
                </Box>
                <CopyIcon
                  onClick={(event) => {
                    event.preventDefault();
                    if (mappedHTML) {
                      navigator.clipboard.writeText(mappedHTML);
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
            {code && (
              <Box css={{ p: { marginBottom: '1em' } }}>
                <ReactSyntaxHighlighter
                  language="javascript"
                  customStyle={{ fontSize: 12 }}
                >
                  {code}
                </ReactSyntaxHighlighter>
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
        {/* Mapped HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Mapped HTML
                </Box>
                <CopyIcon
                  onClick={(event) => {
                    event.preventDefault();
                    if (mappedHTML) {
                      navigator.clipboard.writeText(mappedHTML);
                      toast({
                        title: 'Copied to clipboard',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                />
                {mappedHTMLNumTokens > 0 && (
                  <Text as="span" fontSize="sm" color="gray.500">
                    {mappedHTMLNumTokens} tokens
                  </Text>
                )}
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {prettyMappedHTML && (
              <Box css={{ p: { marginBottom: '1em' } }}>{prettyMappedHTML}</Box>
            )}
          </AccordionPanel>
        </AccordionItem>
        {/* Simplified HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Simplified HTML
                </Box>
                <CopyIcon
                  onClick={(event) => {
                    event.preventDefault();
                    if (simplifiedHTML.value) {
                      navigator.clipboard.writeText(simplifiedHTML.value);
                      toast({
                        title: 'Copied to clipboard',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                />
                {simplifiedHTMLNumTokens > 0 && (
                  <Text as="span" fontSize="sm" color="gray.500">
                    {simplifiedHTMLNumTokens} tokens
                  </Text>
                )}
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {prettySimplifiedHTML && (
              <Box css={{ p: { marginBottom: '1em' } }}>
                {prettySimplifiedHTML}
              </Box>
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
