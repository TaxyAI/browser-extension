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
import { truthyFilter } from '../helpers/utils';
import { JSONTree } from 'react-json-tree';
import TaskHistory, { TaskHistoryEntry } from './TaskHistory';
import CopyButton from './CopyButton';

const TaskUI = () => {
  const [taskInstructions, setTaskInstructions] = useSyncStorage(
    CURRENT_TASK_INSTRUCTIONS,
    ''
  );

  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);
  const taskHistoryRef = useRef(taskHistory);
  useEffect(() => {
    taskHistoryRef.current = taskHistory;
  }, [taskHistory]);

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

  const onBeginTask = useCallback(async () => {
    if (!taskInstructions) return;
    setTaskInProgress(true);
    setTaskHistory([]);

    try {
      while (true) {
        const currentDom = templatize((await getSimplifiedDom()).outerHTML);

        const previousActions = taskHistoryRef.current
          .map((entry) => entry.action)
          .filter(truthyFilter);

        console.log('gonna run');
        const { prompt, response } = await performQuery(
          taskInstructions,
          previousActions,
          currentDom
        );

        const action = extractAction(response);

        if (action === null || action.executableAction.type === 'finish') {
          break;
        }
        setTaskHistory((prev) => [...prev, { prompt, response, action }]);

        await callDOMAction(
          action?.executableAction.type,
          action?.executableAction.args
        );

        if (taskHistoryRef.current.length > 10) {
          break;
        }
        // sleep 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
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
  }, [toast, taskInstructions, taskHistoryRef]);

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
        placeholder="Task instructions"
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
        Begin Task
      </Button>
      <TaskHistory taskHistory={taskHistory} />

      <Heading as="h3" size="md" mb="4">
        Page Context
      </Heading>
      <Accordion allowToggle>
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
