import { Select } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';

const ModelDropdown = () => {
  const selectedModel = useAppState((state) => state.settings.selectedModel);
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const openAIKey = useAppState((state) => state.settings.openAIKey);

  if (!openAIKey) return null;

  return (
    <Select
      value={selectedModel || ''}
      onChange={(e) => updateSettings({ selectedModel: e.target.value })}
    >
      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
      <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo (16k)</option>
      <option value="gpt-4">GPT-4</option>
      <option value="gpt-4-1106-preview">GPT-4 Turbo</option>
      <option value="gpt-4o">GPT-4o</option>
      <option value="gpt-4o-mini">GPT-4o mini</option>
      <option value="o1">o1</option>
    </Select>
  );
};

export default ModelDropdown;
