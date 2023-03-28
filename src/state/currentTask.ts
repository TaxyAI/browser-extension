import { CreateCompletionResponseUsage } from 'openai';
import { attachDebugger, detachDebugger } from '../helpers/chromeDebugger';
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
  usage: CreateCompletionResponseUsage;
};

export type CurrentTaskSlice = {
  tabId: number;
  instructions: string | null;
  history: TaskHistoryEntry[];
  status: 'idle' | 'running' | 'success' | 'error' | 'interrupted';
  actionStatus:
    | 'idle'
    | 'attaching-debugger'
    | 'pulling-dom'
    | 'transforming-dom'
    | 'performing-query'
    | 'performing-action'
    | 'waiting';
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
  actionStatus: 'idle',
  actions: {
    runTask: async (onError) => {
      const wasStopped = () => get().currentTask.status !== 'running';
      const setActionStatus = (status: CurrentTaskSlice['actionStatus']) => {
        set((state) => {
          state.currentTask.actionStatus = status;
        });
      };

      const instructions = get().ui.instructions;

      if (!instructions || get().currentTask.status === 'running') return;

      set((state) => {
        state.currentTask.instructions = instructions;
        state.currentTask.history = [];
        state.currentTask.status = 'running';
        state.currentTask.actionStatus = 'attaching-debugger';
      });

      try {
        let activeTab = (
          await chrome.tabs.query({ active: true, currentWindow: true })
        )[0];

        if (!activeTab.id) throw new Error('No active tab found');
        const tabId = activeTab.id;
        set((state) => {
          state.currentTask.tabId = tabId;
        });

        await attachDebugger(tabId);

        while (true) {
          if (wasStopped()) break;

          setActionStatus('pulling-dom');
          const dom = (await getSimplifiedDom()).outerHTML;

          if (wasStopped()) break;
          setActionStatus('transforming-dom');
          const currentDom = templatize(dom);

          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);

          setActionStatus('performing-query');

          const query = await performQuery(
            instructions,
            previousActions,
            currentDom,
            3,
            onError
          );

          if (!query) {
            set((state) => {
              state.currentTask.status = 'error';
            });
            break;
          }

          if (wasStopped()) break;

          setActionStatus('performing-action');
          const action = extractAction(query.response);

          set((state) => {
            state.currentTask.history.push({
              prompt: query.prompt,
              response: query.response,
              action,
              usage: query.usage,
            });
          });
          if (action === null || action.executableAction.type === 'finish') {
            break;
          }

          await callDOMAction(
            action?.executableAction.type,
            action?.executableAction.args
          );

          if (wasStopped()) break;

          // While testing let's automatically stop after 50 actions to avoid
          // infinite loops
          if (get().currentTask.history.length >= 50) {
            break;
          }

          setActionStatus('waiting');
          // sleep 2 seconds. This is pretty arbitrary; we should figure out a better way to determine when the page has settled.
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
      } finally {
        await detachDebugger(get().currentTask.tabId);
      }
    },
    interrupt: () => {
      set((state) => {
        state.currentTask.status = 'interrupted';
      });
    },
  },
});
