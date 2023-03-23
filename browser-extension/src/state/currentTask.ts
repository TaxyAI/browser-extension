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
  tabId: number;
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
  tabId: -1,
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
        let queryOptions = { active: true, currentWindow: true };
        let activeTab = (await chrome.tabs.query(queryOptions))[0];

        // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
        if (activeTab.url?.startsWith('chrome')) {
          queryOptions = { active: false, currentWindow: true };
          activeTab = (await chrome.tabs.query(queryOptions))[0];
        }
        if (!activeTab.id) throw new Error('No active tab found');
        set((state) => {
          state.currentTask.tabId = activeTab.id!;
        });

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
