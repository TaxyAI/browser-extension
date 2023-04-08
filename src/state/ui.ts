import { MyStateCreator } from './store';

export type UiSlice = {
  instructions: string | null;
  actions: {
    setInstructions: (instructions: string) => void;
  };
};
export const createUiSlice: MyStateCreator<UiSlice> = (set) => ({
  instructions: null,
  actions: {
    setInstructions: (instructions) => {
      set((state) => {
        state.ui.instructions = instructions;
      });
    },
  },
});
