import { CopyIcon } from '@chakra-ui/icons';
import {
  VStack,
  HStack,
  Box,
  useToast,
  Accordion,
  AccordionItem,
  Heading,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Spacer,
} from '@chakra-ui/react';
import React from 'react';
import { ExtractedAction } from '../helpers/extractAction';
import CopyButton from './CopyButton';

export type TaskHistoryEntry = {
  prompt: string;
  response: string;
  action: ExtractedAction | null;
};

type TaskHistoryItemProps = {
  index: number;
  entry: TaskHistoryEntry;
};

const CollapsibleComponent = (props: {
  title: string;
  text: string;
  defaultCollapsed: boolean;
}) => (
  <AccordionItem backgroundColor="white">
    <Heading as="h4" size="xs">
      <AccordionButton>
        <HStack flex="1">
          <Box>{props.title}</Box>
          <CopyButton text={props.text} />{' '}
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
  return (
    <AccordionItem>
      <Heading as="h3" size="sm">
        <AccordionButton>
          <Box mr="4" fontWeight="bold">
            {index + 1}.
          </Box>
          <Box as="span" textAlign="left" flex="1">
            {entry.action?.thought}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <AccordionPanel backgroundColor="gray.100" p="2">
        <Accordion allowToggle w="full" defaultIndex={1}>
          <CollapsibleComponent
            title="Prompt"
            text={entry.prompt}
            defaultCollapsed={true}
          />
          <CollapsibleComponent
            title="Response"
            text={entry.response}
            defaultCollapsed={false}
          />
          <CollapsibleComponent
            title="Action"
            text={JSON.stringify(entry.action, null, 2)}
            defaultCollapsed={true}
          />
        </Accordion>
      </AccordionPanel>
    </AccordionItem>
  );
};

type TaskHistoryProps = {
  taskHistory: TaskHistoryEntry[];
  loading: boolean;
};

export default function TaskHistory({
  taskHistory,
  loading,
}: TaskHistoryProps) {
  if (taskHistory.length === 0) return null;

  return (
    <VStack mb="4">
      <HStack w="full" alignItems="center">
        <Heading as="h3" size="md">
          Task History
        </Heading>
        {/* Loading indicator */}
        {loading && <Spinner color="teal.500" size="sm" />}
        <Spacer />
        <CopyButton text={JSON.stringify(taskHistory, null, 2)} />
      </HStack>
      <Accordion allowToggle w="full" pb="4">
        {taskHistory.map((entry, index) => (
          <TaskHistoryItem key={index} index={index} entry={entry} />
        ))}
      </Accordion>
    </VStack>
  );
}
