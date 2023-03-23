import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createCurrentTask, CurrentTaskSlice } from './currentTask';

export type StoreType = { currentTask: CurrentTaskSlice };

export type MyStateCreator<T> = StateCreator<
  StoreType,
  [['zustand/immer', never]],
  [],
  T
>;

export const useAppStore = create<StoreType>()(
  immer((...a) => ({
    currentTask: createCurrentTask(...a),
  }))
);
