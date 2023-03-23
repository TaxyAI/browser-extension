import { StateCreator } from 'zustand';
import { callDOMAction } from '../helpers/domActions';
import extractAction, { ExtractedAction } from '../helpers/extractAction';
import { performQuery } from '../helpers/performQuery';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { sleep, truthyFilter } from '../helpers/utils';
import { MyStateCreator, StoreType } from './store';

export type TaskHistoryEntry = {
  prompt: string;
  response: string;
  action: ExtractedAction | null;
};

export type CurrentTaskSlice = {
  instructions: string | null;
  history: TaskHistoryEntry[];
  inProgress: boolean;
  interrupted: boolean;
  actions: {
    runTask: (
      instructions: string,
      onError: (error: string) => void
    ) => Promise<void>;
  };
};
export const createCurrentTask: MyStateCreator<CurrentTaskSlice> = (
  set,
  get
) => ({
  instructions: null,
  history: [],
  inProgress: false,
  interrupted: false,
  actions: {
    runTask: async (instructions, onError) => {
      set((state) => {
        state.currentTask.instructions = instructions;
        state.currentTask.history = [];
        state.currentTask.inProgress = true;
        state.currentTask.interrupted = false;
      });

      try {
        while (true) {
          const currentDom = templatize((await getSimplifiedDom()).outerHTML);
          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);

          const { prompt, response } = await performQuery(
            instructions,
            previousActions,
            currentDom,
            3,
            onError
          );

          const action = extractAction(response);

          set((state) => {
            state.currentTask.history.push({ prompt, response, action });
          });
          if (action === null || action.executableAction.type === 'finish') {
            break;
          }

          await callDOMAction(
            action?.executableAction.type,
            action?.executableAction.args
          );

          if (get().currentTask.history.length >= 10) {
            break;
          }
          // sleep 2 seconds
          await sleep(2000);
        }
      } catch (e: any) {
        onError(e.message);
      } finally {
        set((state) => (state.currentTask.inProgress = false));
      }
    },
  },
});
