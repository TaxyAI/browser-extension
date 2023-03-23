import { ChatIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import parserHTML from 'prettier/parser-html';
import prettier from 'prettier/standalone';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useAsync } from 'react-use';
import { callDOMAction } from '../helpers/domActions';
import extractAction from '../helpers/extractAction';
import { performQuery } from '../helpers/performQuery';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { sleep, truthyFilter } from '../helpers/utils';
import { useAppStore, useStore } from '../state/store';
import {
  CURRENT_TASK_INSTRUCTIONS,
  useSyncStorage,
} from '../state/syncStorage';
import CopyButton from './CopyButton';
import TaskHistory, { TaskHistoryEntry } from './TaskHistory';
import TokenCount from './TokenCount';

const TaskUI = () => {
  const [taskInstructions, setTaskInstructions] = useSyncStorage(
    CURRENT_TASK_INSTRUCTIONS,
    ''
  );

  const state = useAppStore((state) => ({
    taskHistory: state.currentTask.history,
    taskInProgress: state.currentTask.inProgress,
    taskInterrupted: state.currentTask.interrupted,
    runTask: state.currentTask.actions.runTask,
  }));

  const toast = useToast();

  const toastError = useCallback(
    (message: string) => {
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    [toast]
  );

  const runTask = () => {
    taskInstructions && state.runTask(taskInstructions, toastError);
  };

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runTask();
    }
  };

  return (
    <>
      <Textarea
        autoFocus
        noOfLines={2}
        placeholder="Task instructions"
        value={taskInstructions || ''}
        onChange={(e) => setTaskInstructions(e.target.value)}
        mb={2}
        onKeyDown={onKeyDown}
      />
      <Button
        leftIcon={state.taskInProgress ? <Spinner /> : <ChatIcon />}
        onClick={runTask}
        colorScheme="blue"
        disabled={state.taskInProgress || !taskInstructions}
        mb={4}
      >
        Execute Task
      </Button>
      <TaskHistory />

      <Heading as="h3" size="md" mb="4">
        Page Context
      </Heading>
      <Accordion allowToggle allowMultiple>
        {/* Templatized HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left">
                  Templatized HTML
                </Box>
                <CopyButton text={templatizedHTML} />
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
                <Box as="span" textAlign="left">
                  Simplified HTML
                </Box>
                <CopyButton text={simplifiedHTML} />
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
