import { CreateCompletionResponseUsage } from 'openai';
import { attachDebugger, detachDebugger } from '../helpers/chromeDebugger';
import {
  disableIncompatibleExtensions,
  reenableExtensions,
} from '../helpers/disableExtensions';
import { callDOMAction } from '../helpers/domActions';
import {
  ParsedResponse,
  ParsedResponseSuccess,
  parseResponse,
} from '../helpers/parseResponse';
import { determineNextAction, checkForInjectionAndGetProbability } from '../helpers/determineNextAction';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { sleep, truthyFilter } from '../helpers/utils';
import { MyStateCreator } from './store';

export type TaskHistoryEntry = {
  prompt: string;
  response: string;
  action: ParsedResponse;
  usage: CreateCompletionResponseUsage;
  injectionProbability: number; 
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
    | 'checking-injection' 
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
        const activeTab = (
          await chrome.tabs.query({ active: true, currentWindow: true })
        )[0];

        if (!activeTab.id) throw new Error('No active tab found');
        const tabId = activeTab.id;
        set((state) => {
          state.currentTask.tabId = tabId;
        });

        await attachDebugger(tabId);
        await disableIncompatibleExtensions();

        while (true) {
          if (wasStopped()) break;

          setActionStatus('pulling-dom');
          const pageDOM = await getSimplifiedDom();
          if (!pageDOM) {
            set((state) => {
              state.currentTask.status = 'error';
            });
            break;
          }
          const html = pageDOM.outerHTML;
          let injectionProbability = 0; 
          

          if (wasStopped()) break;
          setActionStatus('transforming-dom');
          const currentDom = templatize(html);

          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);

            setActionStatus('checking-injection');
            if (instructions !== null) {
              injectionProbability = await checkForInjectionAndGetProbability(instructions, 
                previousActions.filter(
                  (pa) => !('error' in pa)
                ) as ParsedResponseSuccess[],
                currentDom);
              // Log the injection check probability without aborting further actions
              console.log(`Injection check probability: ${injectionProbability}`);
            }

          setActionStatus('performing-query');

          const query = await determineNextAction(
            instructions,
            previousActions.filter(
              (pa) => !('error' in pa)
            ) as ParsedResponseSuccess[],
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
          const action = parseResponse(query.response);

          set((state) => {
            state.currentTask.history.push({
              prompt: query.prompt,
              response: query.response,
              action,
              usage: query.usage,
              injectionProbability: injectionProbability,
            });
          });
          if ('error' in action) {
            onError(action.error);
            break;
          }
          if (
            action === null ||
            action.parsedAction.name === 'finish' ||
            action.parsedAction.name === 'fail'
          ) {
            break;
          }

          if (action.parsedAction.name === 'click') {
            await callDOMAction('click', action.parsedAction.args);
          } else if (action.parsedAction.name === 'setValue') {
            await callDOMAction(
              action?.parsedAction.name,
              action?.parsedAction.args
            );
          }

          if (wasStopped()) break;

          if (get().currentTask.history.length >= 50) {
            break;
          }

          setActionStatus('waiting');
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
        await reenableExtensions();
      }
    },
    interrupt: () => {
      set((state) => {
        state.currentTask.status = 'interrupted';
      });
    },
  },
});

