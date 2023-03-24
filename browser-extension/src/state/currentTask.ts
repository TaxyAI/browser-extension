import { callDOMAction } from '../helpers/domActions';
import extractAction, { ExtractedAction } from '../helpers/extractAction';
import { performQuery } from '../helpers/performQuery';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { sleep, truthyFilter } from '../helpers/utils';
import { MyStateCreator } from './store';

export type TaskHistoryEntry = {
  prompt: string;
  response: string;
  action: ExtractedAction | null;
};

export type CurrentTaskSlice = {
  tabId: number;
  instructions: string | null;
  history: TaskHistoryEntry[];
  status: 'idle' | 'running' | 'success' | 'error' | 'interrupted';
  actions: {
    runTask: (onError: (error: string) => void) => Promise<void>;
    interrupt: () => void;
  };
};
export const createCurrentTaskSlice: MyStateCreator<CurrentTaskSlice> = (
  set,
  get
) => ({
  tabId: -1,
  instructions: null,
  history: [],
  status: 'idle',
  actions: {
    runTask: async (onError) => {
      const wasStopped = () => get().currentTask.status !== 'running';

      const instructions = get().ui.instructions;

      if (!instructions || get().currentTask.status === 'running') return;

      set((state) => {
        state.currentTask.instructions = instructions;
        state.currentTask.history = [];
        state.currentTask.status = 'running';
      });
      try {
        let queryOptions = { active: true, currentWindow: true };
        let activeTab = (await chrome.tabs.query(queryOptions))[0];

        if (!activeTab.id) throw new Error('No active tab found');
        set((state) => {
          state.currentTask.tabId = activeTab.id!;
        });

        while (true) {
          if (wasStopped()) break;

          const currentDom = templatize((await getSimplifiedDom()).outerHTML);
          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);

          if (wasStopped()) break;

          const { prompt, response } = await performQuery(
            instructions,
            previousActions,
            currentDom,
            3,
            onError
          );

          if (wasStopped()) break;

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

          if (wasStopped()) break;

          // While testing let's automatically stop after 10 action to avoid
          // infinite loops
          if (get().currentTask.history.length >= 10) {
            break;
          }
          // sleep 2 seconds
          await sleep(2000);
        }
        set((state) => {
          state.currentTask.status = 'success';
        });
      } catch (e: any) {
        onError(e.message);
        set((state) => {
          state.currentTask.status = 'error';
        });
      }
    },
    interrupt: () => {
      set((state) => {
        state.currentTask.status = 'interrupted';
      });
    },
  },
});
