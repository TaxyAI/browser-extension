import { RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';

const OptionsDropdown = () => {
  const { openAIKey, PGKey, updateSettings } = useAppState((state) => ({
    openAIKey: state.settings.openAIKey,
    PGKey: state.settings.PGKey,
    updateSettings: state.settings.actions.update,
  }));

  if (!openAIKey && !PGKey) return null;

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<SettingsIcon />}
        variant="outline"
      />
      <MenuList>
        <MenuItem
          icon={<RepeatIcon />}
          onClick={() => {
            updateSettings({ openAIKey: '' });
          }}
        >
          Reset API Key
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default OptionsDropdown;
