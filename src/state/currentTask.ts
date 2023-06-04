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
import { determineNextAction } from '../helpers/determineNextAction';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { sleep, truthyFilter } from '../helpers/utils';
import { MyStateCreator } from './store';
import { track, setSessionId } from '@amplitude/analytics-browser';
import { v4 as uuidv4 } from 'uuid';
import { IWaterfallEvent, useEventStore } from './store';

export type TaskHistoryEntry = {
  prompt: string;
  response: string;
  action: ParsedResponse;
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

let time: null | number = null;
export const events: Array<IWaterfallEvent> = [];
let internalTrack = function(eventInput: string, eventProperties?: Record<string, any> | undefined, session?: number, eventOptions?: import("@amplitude/analytics-types").EventOptions | undefined) {
  if (time == null) {
    time = performance.now();
  } else {
    const newTime = performance.now();
    const duration = newTime - time;
    time = newTime;
    // useStore.setState({name: ‘John’})
    const storedEvents = useEventStore.getState().events
    useEventStore.setState({
      events: [
        ...storedEvents.slice(0, events.length - 1),
        {
          ...storedEvents[storedEvents.length - 1],
          elapsed: duration,
          finished: newTime,
        }
      ],
    });
  };
  
  const event: IWaterfallEvent = {
    eventInput,
    eventProperties,
    start: time,
    elapsed: null,
    finished: null,
  };
  const storedEvents = useEventStore.getState().events
  useEventStore.setState({
    events: [...storedEvents, event],
  });
  if (session) {
    setSessionId(session);
  }
  track(eventInput, eventProperties);
  // fetch(`http://127.0.0.1:8000/${eventInput}`, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     ...eventProperties,
  //     session,
  //   })
  // });
}

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

        const session = Date.now();
        const startSessionProperties = {
          instructions,
          site: window.location.toString(),
        };
        internalTrack("StartTask", startSessionProperties, session);
        let query = {};
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const actionId = uuidv4();
          
          if (wasStopped()) {
            const cancelProperties = {
              actionId,
            };
            internalTrack("CancelTask", cancelProperties, session);
            break;
          }

          const processDOMProperties = {
            actionId,
            // history: JSON.stringify(get().currentTask.history),
          };
          internalTrack("ProcessDOM", processDOMProperties, session);

          setActionStatus('pulling-dom');
          const pageDOM = await getSimplifiedDom();
          if (!pageDOM) {
            set((state) => {
              state.currentTask.status = 'error';
            });
          
            const errorProperties = {
              actionId,
              error: 'Could not get DOM',
            };
            internalTrack("ActionError", errorProperties, session);

            break;
          }
          const html = pageDOM.outerHTML;

          if (wasStopped()) {
            const cancelProperties = {
              actionId,
            };
            internalTrack("CancelTask", cancelProperties, session);

            break;
          }
          setActionStatus('transforming-dom');
          const currentDom = templatize(html);

          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);
          
          const determineActionProperties = {
            actionId,
            // history: JSON.stringify(get().currentTask.history),
            // dom: pageDOM,
          };
          internalTrack("DetermineAction", determineActionProperties, session);

          setActionStatus('performing-query');

          query = await determineNextAction(
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

            const errorProperties = {
              actionId,
              error: 'Could not determine next action',
            };
            internalTrack("ActionError", errorProperties, session);

            break;
          }

          if (wasStopped()) {
            const cancelProperties = {
              actionId,
            };
            internalTrack("CancelTask", cancelProperties, session);

            break;
          }

          const action = parseResponse(query.response);

          const performActionProperties = {
            actionId,
            ...query,
            parsedResponse: action,
          }
          internalTrack("PerformAction", performActionProperties, session);

          setActionStatus('performing-action');

          set((state) => {
            state.currentTask.history.push({
              prompt: query.prompt,
              response: query.response,
              action,
              usage: query.usage,
            });
          });
          if ('error' in action) {
            onError(action.error);

            const errorProperties = {
              actionId,
              error: action.error,
            };
            internalTrack("ActionError", errorProperties, session);

            break;
          }
          if (
            action === null ||
            action.parsedAction.name === 'finish' ||
            action.parsedAction.name === 'fail'
          ) {
            if (action == null) {
              const errorProperties = {
                actionId,
                error: 'No action returned from model',
              };
              internalTrack("ActionError", errorProperties, session);
            } else if (action.parsedAction.name === 'finish') {
              const successProperties = {
                actionId,
                parsedResponse: action,
              };
              internalTrack("ActionSuccess", successProperties, session);
            } else if (action.parsedAction.name === 'fail') {
              const errorProperties = {
                actionId,
                error: 'Model returned fail action',
                parsedResponse: action,
              };
              internalTrack("ActionError", errorProperties, session);
            }
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

          if (wasStopped()) {
            const cancelProperties = {
              actionId,
            };
            internalTrack("CancelTask", cancelProperties, session);

            break;
          }

          // While testing let's automatically stop after 50 actions to avoid
          // infinite loops
          const actionLimit = 50;
          if (get().currentTask.history.length >= actionLimit) {
            const errorProperties = {
              actionId,
              error: `Stopped after ${actionLimit} actions`,
            };
            internalTrack("ActionError", errorProperties, session);
            
            break;
          }

          const finishActionProperties = {
            actionId,
            action: action?.parsedAction.name,
          }
          internalTrack("FinishAction", finishActionProperties, session);

          setActionStatus('waiting');
          // sleep 2 seconds. This is pretty arbitrary; we should figure out a better way to determine when the page has settled.
          await sleep(2000);
        }
        set((state) => {
          state.currentTask.status = 'success';
        });
        
        const finishSessionProperties = {
          ...query
        };
        internalTrack("FinishTask", finishSessionProperties, session);
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
