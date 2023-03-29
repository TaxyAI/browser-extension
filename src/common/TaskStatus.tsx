import React from 'react';
import { Box } from '@chakra-ui/react';
import { CurrentTaskSlice } from '../state/currentTask';
import { useAppState } from '../state/store';

export default function TaskStatus() {
  const { taskStatus, actionStatus } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    actionStatus: state.currentTask.actionStatus,
  }));

  if (taskStatus !== 'running') {
    return null;
  }

  const displayedStatus: Record<CurrentTaskSlice['actionStatus'], string> = {
    idle: 'Idle',
    'attaching-debugger': 'Attaching Debugger',
    'pulling-dom': 'Reading Page',
    'transforming-dom': 'Reading Page',
    'performing-query': 'Running GPT',
    'performing-action': 'Performing Action',
    waiting: 'Waiting',
  };

  return (
    <Box textColor="gray.500" textAlign="center" mb={8} fontSize="sm">
      {displayedStatus[actionStatus]}
    </Box>
  );
}
