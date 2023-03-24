import { ChatIcon } from '@chakra-ui/icons';
import { Button, HStack, Icon, Spacer, Spinner } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';
import { BsPlayFill, BsStopFill } from 'react-icons/bs';

export default function RunTaskButton(props: { runTask: () => void }) {
  const state = useAppState((state) => ({
    taskState: state.currentTask.status,
    instructions: state.ui.instructions,
    interruptTask: state.currentTask.actions.interrupt,
  }));

  let button = (
    <Button
      rightIcon={<Icon as={BsPlayFill} boxSize={6} />}
      onClick={props.runTask}
      colorScheme="green"
      disabled={state.taskState === 'running' || !state.instructions}
      mb={4}
    >
      Start Task
    </Button>
  );

  if (state.taskState === 'running') {
    button = (
      <Button
        rightIcon={<Icon as={BsStopFill} boxSize={6} />}
        onClick={state.interruptTask}
        colorScheme="red"
      >
        Stop
      </Button>
    );
  }

  return (
    <HStack alignItems="center" mb={4}>
      {button}
      <Spacer />
      {state.taskState === 'running' && <Spinner color="blue.500" />}
    </HStack>
  );
}
