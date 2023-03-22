import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import extractAction, { ExtractedAction } from '../helpers/extractAction';
import { CURRENT_TASK_INSTRUCTIONS, useSyncStorage } from '../state';
import TokenCount from './TokenCount';
import { callDOMAction } from '../helpers/domActions';
import templatize from '../helpers/shrinkHTML/templatize';

const TaskUI = () => {
  const [taskInstructions, setTaskInstructions] = useSyncStorage(
    CURRENT_TASK_INSTRUCTIONS,
    ''
  );

  const [previousActions, setPreviousActions] = useState<ExtractedAction[]>([]);

  const [taskInProgress, setTaskInProgress] = React.useState(false);

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

  const [stepOutput, setStepOutput] = React.useState('');

  const onBeginTask = useCallback(async () => {
    if (!taskInstructions) return;
    setTaskInProgress(true);
    setPreviousActions([]);

    try {
      while (true) {
        const currentDom = templatize((await getSimplifiedDom()).outerHTML);

        const response = await performQuery(
          taskInstructions,
          previousActions,
          currentDom
        );

        const action = extractAction(response);

        setStepOutput(
          `${response} \n\nExtracted Action: \n ${JSON.stringify(action)}`
        );

        if (action === null || action.executableAction.type === 'finish') {
          break;
        }
        callDOMAction(
          action?.executableAction.type,
          action?.executableAction.args
        );
        setPreviousActions((prev) => [...prev, action]);
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
      setTaskInProgress(false);
    }
  }, [toast, taskInstructions, previousActions]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onBeginTask();
    }
  };

  return (
    <>
      <Textarea
        autoFocus
        noOfLines={2}
        placeholder="Your question"
        value={taskInstructions || ''}
        onChange={(e) => setTaskInstructions(e.target.value)}
        mb={2}
        onKeyDown={onKeyDown}
      />
      <Button
        leftIcon={taskInProgress ? <Spinner /> : <ChatIcon />}
        onClick={onBeginTask}
        colorScheme="blue"
        disabled={taskInProgress || !taskInstructions || !templatizedHTML}
        mb={4}
      >
        Submit Instructions
      </Button>
      {/* LLM Response */}
      {stepOutput && (
        <VStack>
          <HStack w="full">
            <Box as="span" textAlign="left" mr="4">
              LLM Response
            </Box>
            <CopyIcon
              onClick={(event) => {
                event.preventDefault();
                if (stepOutput) {
                  navigator.clipboard.writeText(stepOutput);
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
              {stepOutput}
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
