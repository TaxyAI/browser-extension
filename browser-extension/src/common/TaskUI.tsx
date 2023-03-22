import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Box,
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
import { performQuery } from '../helpers/performQuery';
import extractActions frqwjom '../helpers/extractActions';
import { MOST_RECENT_QUERY, useSyncStorage } from '../state';
import TokenCount from './TokenCount';
import { callDOMAction } from '../helpers/domActions';
import templatize from '../helpers/shrinkHTML/templatize';

const TaskUI = () => {
  const [mostRecentQuery, setMostRecentQuery] = useSyncStorage(
    MOST_RECENT_QUERY,
    ''
  );
  const [instructionsContent, setInstructionsContent] =
    React.useState(mostRecentQuery);
  useEffect(() => {
    setInstructionsContent(mostRecentQuery);
  }, [mostRecentQuery]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = React.useState(false);

  const toast = useToast();

  const simplifiedHTML =
    useAsync(async () => (await getSimplifiedDom()).outerHTML, []).value ?? '';
  const templatizedHTML = useMemo(() => {
    if (!simplifiedHTML) return '';
    return templatize(simplifiedHTML);
  }, [simplifiedHTML]);

  const prettySimplifiedHTML = useMemo(
    () => <PrettyHTML html={simplifiedHTML} />,
    [simplifiedHTML]
  );

  const [code, setCode] = React.useState('');

  const onSubmitInstructions = useCallback(async () => {
    if (!instructionsContent) return;
    setLoading(true);
    setMostRecentQuery(instructionsContent);

    try {
      // Generate code from instructions
      const output = await performQuery(instructionsContent, templatizedHTML);
      const actions = extractActions(output);
      setCode(
        output + '\n\n' + 'Extracted Actions:\n' + JSON.stringify(actions)
      );
      for (const action of actions) {
        callDOMAction(action['type'], action['args']);
        // sleep 2 seconds
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
  }, [toast, setMostRecentQuery, instructionsContent, templatizedHTML]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitInstructions();
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
        onClick={onSubmitInstructions}
        colorScheme="blue"
        disabled={loading || !instructionsContent || !templatizedHTML}
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
        {/* Templatized HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left" mr="4">
                  Templatized HTML
                </Box>
                <CopyIcon
                  onClick={async (event) => {
                    event.preventDefault();
                    if (templatizedHTML) {
                      try {
                        await navigator.clipboard.writeText(templatizedHTML);
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
                <TokenCount html={templatizedHTML} />
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {templatizedHTML && (
              <Box fontSize="sm">
                <pre>{templatizedHTML}</pre>
              </Box>
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

const formatHTML = (html: string) => {
  try {
    return prettier.format(html, {
      parser: 'html',
      plugins: [parserHTML],
      htmlWhitespaceSensitivity: 'ignore',
    });
  } catch (e: any) {
    return html;
  }
};

const PrettyHTML = ({ html }: { html: string }) => {
  return (
    <SyntaxHighlighter language="htmlbars" customStyle={{ fontSize: 12 }}>
      {formatHTML(html)}
    </SyntaxHighlighter>
  );
};

export default TaskUI;
