import {
  VStack,
  HStack,
  Box,
  Accordion,
  AccordionItem,
  Heading,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spacer,
  ColorProps,
  BackgroundProps,
} from '@chakra-ui/react';
import React from 'react';
import { TaskHistoryEntry } from '../state/currentTask';
import { useAppState } from '../state/store';
import CopyButton from './CopyButton';

type TaskHistoryItemProps = {
  index: number;
  entry: TaskHistoryEntry;
};

const CollapsibleComponent = (props: {
  title: string;
  subtitle?: string;
  text: string;
}) => (
  <AccordionItem backgroundColor="white">
    <Heading as="h4" size="xs">
      <AccordionButton>
        <HStack flex="1">
          <Box>{props.title}</Box>
          <CopyButton text={props.text} /> <Spacer />
          {props.subtitle && (
            <Box as="span" fontSize="xs" color="gray.500" mr={4}>
              {props.subtitle}
            </Box>
          )}
        </HStack>
        <AccordionIcon />
      </AccordionButton>
    </Heading>
    <AccordionPanel>
      {props.text.split('\n').map((line, index) => (
        <Box key={index} fontSize="xs">
          {line}
          <br />
        </Box>
      ))}
    </AccordionPanel>
  </AccordionItem>
);

const TaskHistoryItem = ({ index, entry }: TaskHistoryItemProps) => {
  let itemTitle = '';
  if ('error' in entry.action) {
    itemTitle = `Error: ${entry.action.error}`;
  } else if (entry.action?.thought) {
    itemTitle = entry.action.thought;
  }

  const colors: {
    text: ColorProps['textColor'];
    bg: BackgroundProps['bgColor'];
  } = {
    text: undefined,
    bg: undefined,
  };
  if ('error' in entry.action || entry.action.parsedAction.name === 'fail') {
    colors.text = 'red.800';
    colors.bg = 'red.100';
  } else if (
    'parsedAction' in entry.action &&
    entry.action.parsedAction.name === 'finish'
  ) {
    colors.text = 'green.800';
    colors.bg = 'green.100';
  }

  return (
    <AccordionItem>
      <Heading as="h3" size="sm" textColor={colors.text} bgColor={colors.bg}>
        <AccordionButton>
          <Box mr="4" fontWeight="bold">
            {index + 1}.
          </Box>
          <Box as="span" textAlign="left" flex="1">
            {itemTitle}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <AccordionPanel backgroundColor="gray.100" p="2">
        <Accordion allowMultiple w="full" defaultIndex={1}>
          <CollapsibleComponent
            title="Prompt"
            subtitle={`${entry.usage.prompt_tokens} tokens`}
            text={entry.prompt}
          />
          <CollapsibleComponent
            title="Response"
            subtitle={`${entry.usage.completion_tokens} tokens`}
            text={entry.response}
          />
          <CollapsibleComponent
            title="Action"
            text={JSON.stringify(entry.action, null, 2)}
          />
        </Accordion>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default function TaskHistory() {
  const { taskHistory, taskStatus } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    taskHistory: state.currentTask.history,
  }));

  if (taskHistory.length === 0 && taskStatus !== 'running') return null;

  return (
    <VStack mt={8}>
      <HStack w="full">
        <Heading as="h3" size="md">
          Action History
        </Heading>
        <Spacer />
        <CopyButton text={JSON.stringify(taskHistory, null, 2)} />
      </HStack>
      <Accordion allowMultiple w="full" pb="4">
        {taskHistory.map((entry, index) => (
          <TaskHistoryItem key={index} index={index} entry={entry} />
        ))}
      </Accordion>
    </VStack>
  );
}
