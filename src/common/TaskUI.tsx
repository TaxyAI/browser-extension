import { HStack, Spacer, Textarea, useToast } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { debugMode } from '../constants';
import { useAppState } from '../state/store';
import PageContext from './PageContext';
import RunTaskButton from './RunTaskButton';
import TaskHistory from './TaskHistory';
import TaskStatus from './TaskStatus';

const TaskUI = () => {
  const state = useAppState((state) => ({
    taskHistory: state.currentTask.history,
    taskStatus: state.currentTask.status,
    runTask: state.currentTask.actions.runTask,
    instructions: state.ui.instructions,
    setInstructions: state.ui.actions.setInstructions,
  }));

  const taskInProgress = state.taskStatus === 'running';

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
    state.instructions && state.runTask(toastError);
  };

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
        placeholder="Taxy uses OpenAI's GPT-4 API to perform actions on the current page. Try telling it to sign up for a newsletter, or to add an item to your cart."
        value={state.instructions || ''}
        disabled={taskInProgress}
        onChange={(e) => state.setInstructions(e.target.value)}
        mb={2}
        onKeyDown={onKeyDown}
      />
      <HStack>
        <RunTaskButton runTask={runTask} />
        <Spacer />
        {debugMode && <TaskStatus />}
      </HStack>
      <TaskHistory />
      {debugMode && <PageContext />}
    </>
  );
};

export default TaskUI;
