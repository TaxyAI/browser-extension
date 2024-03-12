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
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { TaskHistoryEntry } from '../state/currentTask';
import { useAppState } from '../state/store';
import CopyButton from './CopyButton';

type TaskHistoryItemProps = {
  index: number;
  entry: TaskHistoryEntry;
};

const CollapsibleComponent = ({ title, subtitle, text }: {
  title: string;
  subtitle?: string;
  text: string;
}) => (
  <AccordionItem>
    <h2>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          {title}
        </Box>
        <CopyButton text={text} />
        {subtitle && (
          <Box as="span" fontSize="sm" color="gray.500" ml={4}>
            {subtitle}
          </Box>
        )}
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel pb={4}>
      {text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </AccordionPanel>
  </AccordionItem>
);

const TaskHistoryItem = ({ index, entry }: TaskHistoryItemProps) => {
  let itemTitle = 'Action';

  // Assuming 'name' and 'description' are properties you can rely on.
  if ('parsedAction' in entry.action) {
    itemTitle = entry.action.parsedAction.name; // Use the action's name as the title.
    // Optionally, you could use description or a combination of properties.
  } else if ('error' in entry.action) {
    itemTitle = `Error: ${entry.action.error}`; // Use the error message if present.
  }

  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const bgColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <AccordionItem>
      <Heading as="h3" size="sm" textColor={textColor} bgColor={bgColor}>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {`${index + 1}. ${itemTitle}`}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <AccordionPanel pb={4}>
        <CollapsibleComponent
          title="Prompt"
          subtitle={`Tokens: ${entry.usage.total_tokens}`}
          text={entry.prompt}
        />
        <CollapsibleComponent
          title="Response"
          text={entry.response}
        />
        <CollapsibleComponent
          title="Action Details"
          text={JSON.stringify(entry.action, null, 2)}
        />
        <CollapsibleComponent
          title="Injection Attempt Status"
          text={`Injection check probability: ${entry.injectionProbability}`}
        />
      </AccordionPanel>
    </AccordionItem>
  );
};

export default function TaskHistory() {
  const { taskHistory, taskStatus } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    taskHistory: state.currentTask.history,
  }));

  if (taskHistory.length === 0 && taskStatus !== 'running') {
    return null;
  }

  return (
    <VStack mt={8} w="full">
      <HStack w="full">
        <Heading as="h3" size="md">
          Action History
        </Heading>
        <Spacer />
        <CopyButton text={JSON.stringify(taskHistory, null, 2)} />
      </HStack>
      <Accordion allowMultiple w="full" pb={4}>
        {taskHistory.map((entry, index) => (
          <TaskHistoryItem key={index} index={index} entry={entry} />
        ))}
      </Accordion>
    </VStack>
  );
}
