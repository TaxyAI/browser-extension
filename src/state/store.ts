import { merge } from 'lodash';
import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { createCurrentTaskSlice, CurrentTaskSlice } from './currentTask';
import { createUiSlice, UiSlice } from './ui';
import { createSettingsSlice, SettingsSlice } from './settings';
import { createStore } from 'zustand/vanilla';

export interface IWaterfallEvent {
  eventInput: string;
  eventProperties?: Record<string, any> | undefined;
  start: number;
  elapsed: number | null;
  finished: number | null;
}

export type StoreType = {
  currentTask: CurrentTaskSlice;
  ui: UiSlice;
  settings: SettingsSlice;
};

export type MyStateCreator<T> = StateCreator<
  StoreType,
  [['zustand/immer', never]],
  [],
  T
>;

export const useAppState = create<StoreType>()(
  persist(
    immer(
      devtools((...a) => ({
        currentTask: createCurrentTaskSlice(...a),
        ui: createUiSlice(...a),
        settings: createSettingsSlice(...a),
      }))
    ),
    {
      name: 'app-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Stuff we want to persist
        ui: {
          instructions: state.ui.instructions,
        },
        settings: {
          openAIKey: state.settings.openAIKey,
          selectedModel: state.settings.selectedModel,
        },
      }),
      merge: (persistedState, currentState) =>
        merge(currentState, persistedState),
    }
  )
);

const initialEventState = {
  events: [] as IWaterfallEvent[],
};

export const useEventStore = createStore(() => ({
  ...initialEventState,
}));

// @ts-expect-error used for debugging
window.getState = useAppState.getState;
