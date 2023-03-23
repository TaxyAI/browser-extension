import { Select } from '@chakra-ui/react';
import { SELECTED_OPENAI_MODEL, useSyncStorage } from '../state/syncStorage';
import React from 'react';

const ModelDropdown = () => {
  const [selectedModel, setSelectedModel] = useSyncStorage(
    SELECTED_OPENAI_MODEL,
    'gpt-3.5-turbo'
  );

  return (
    // Chakra UI Select component
    <Select
      value={selectedModel || ''}
      onChange={(e) => setSelectedModel(e.target.value)}
    >
      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
      <option value="gpt-4">GPT-4</option>
    </Select>
  );
};

export default ModelDropdown;
