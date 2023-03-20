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
  VStack,
} from '@chakra-ui/react';
import { ChatIcon, CopyIcon } from '@chakra-ui/icons';
import prettier from 'prettier/standalone';
import parserHTML from 'prettier/parser-html';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useAsync } from 'react-use';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { mapHTML } from '../helpers/mapHTML';
import { performQuery } from '../helpers/performQuery';
import extractActions from '../helpers/extractActions';
import { callRPC } from '../helpers/pageRPC';
import { MOST_RECENT_QUERY, useSyncStorage } from '../state';
import { countTokens } from '../helpers/countTokens';

const TextToJS = () => {
  const [instructionsContent, setInstructionsContent] = useSyncStorage(
    MOST_RECENT_QUERY,
    ''
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = React.useState(false);

  const toast = useToast();

  const simplifiedHTML = useAsync(getSimplifiedDom, []).value || '';
  const mappedHTML = useMemo(() => {
    if (!simplifiedHTML) return '';
    return mapHTML(simplifiedHTML);
  }, [simplifiedHTML]);

  const prettySimplifiedHTML = useMemo(
    () => <PrettyHTML html={simplifiedHTML} />,
    [simplifiedHTML]
  );

  const prettyMappedHTML = useMemo(() => {
    if (!mappedHTML) return '';
    return <PrettyHTML html={mappedHTML} />;
  }, [mappedHTML]);

  const [code, setCode] = React.useState('');

  const onSubmitInstructions = useCallback(
    async (instructions: string | null, mappedHTML: string) => {
      if (!instructions) return;
      setLoading(true);

      try {
        // Generate code from instructions
        const output = await performQuery(instructions, mappedHTML);
        const actions = extractActions(output);
        setCode(
          output + '\n\n' + 'Extracted Actions:\n' + JSON.stringify(actions)
        );
        for (const action of actions) {
          callRPC(action['type'], action['args'] ?? []);
          // sleep 1 second
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
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
    [toast]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitInstructions(instructionsContent, mappedHTML);
    }
  };

  return (
    <>
      <Textarea
        autoFocus
        noOfLines={2}
        placeholder="Your question"
        value={instructionsContent || ''}
        onChange={(e) => setInstructionsContent(e.target.value)}
        mb={2}
        ref={textareaRef}
        onKeyDown={onKeyDown}
      />
      <Button
        leftIcon={loading ? <Spinner /> : <ChatIcon />}
        onClick={() => onSubmitInstructions(instructionsContent, mappedHTML)}
        colorScheme="blue"
        disabled={loading || !instructionsContent || !mappedHTML}
        mb={4}
      >
        Submit Instructions
      </Button>
      {/* Generated Code */}
      {code && (
        <VStack>
          <HStack w="full">
            <Box as="span" textAlign="left" mr="4">
              Generated Code
            </Box>
            <CopyIcon
              onClick={(event) => {
                event.preventDefault();
                if (code) {
                  navigator.clipboard.writeText(code);
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

          <Box w="full" css={{ p: { marginBottom: '1em' } }}>
            <SyntaxHighlighter
              language="javascript"
              customStyle={{ fontSize: 12 }}
              wrapLines
              wrapLongLines
            >
              {code}
            </SyntaxHighlighter>
          </Box>
        </VStack>
      )}
      <Accordion allowToggle>
        {/* Mapped HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Mapped HTML
                </Box>
                <CopyIcon
                  onClick={async (event) => {
                    event.preventDefault();
                    if (mappedHTML) {
                      try {
                        await navigator.clipboard.writeText(mappedHTML);
                        toast({
                          title: 'Copied to clipboard',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      } catch (e: any) {
                        toast({
                          title: 'Error',
                          description: e.message,
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                      }
                    }
                  }}
                />
                <TokenCount html={mappedHTML} />
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
                  onClick={async (event) => {
                    event.preventDefault();
                    if (simplifiedHTML) {
                      try {
                        await navigator.clipboard.writeText(simplifiedHTML);
                        toast({
                          title: 'Copied to clipboard',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      } catch (e: any) {
                        toast({
                          title: 'Error',
                          description: e.message,
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                      }
                    }
                  }}
                />
                <TokenCount html={simplifiedHTML} />
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

const formatHTML = (html: string) =>
  prettier.format(html, {
    parser: 'html',
    plugins: [parserHTML],
    htmlWhitespaceSensitivity: 'ignore',
  });

const PrettyHTML = ({ html }: { html: string }) => {
  return (
    <SyntaxHighlighter language="htmlbars" customStyle={{ fontSize: 12 }}>
      {formatHTML(html)}
    </SyntaxHighlighter>
  );
};

const TokenCount = ({ html }: { html: string }) => {
  const numTokens = useAsync(() => countTokens(html), [html]).value || null;

  return (
    <>
      <Text as="span" fontSize="sm" color="gray.500">
        {numTokens ? numTokens > 0 && numTokens + ' tokens' : 'Counting...'}
      </Text>
    </>
  );
};

export default TextToJS;
