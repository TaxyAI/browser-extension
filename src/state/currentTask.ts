import { attachDebugger, detachDebugger } from '../helpers/chromeDebugger';
import {
  disableIncompatibleExtensions,
  reenableExtensions,
} from '../helpers/disableExtensions';
import { setValue, click } from '../helpers/domActions';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { MyStateCreator } from './store';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { DynamicTool } from 'langchain/tools';
import { AgentExecutor } from 'langchain/agents';
import { CallbackManager } from 'langchain/callbacks';
import { LLMResult } from 'langchain/schema';
import { useAppState } from '../state/store';
import { ChatConversationalAgent } from '../helpers/chatConversationalAgent';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

type ParsedResponse =
  | {
      thought: string;
      tool: string;
      input: string;
    }
  | {
      error: string;
    };

export type TaskHistoryEntry = {
  action: ParsedResponse;
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

      const callbackManager = CallbackManager.fromHandlers({
        async handleLLMStart(_llm: { name: string }, prompts: string[]) {
          console.log(JSON.stringify(prompts, null, 2));
        },
        async handleLLMEnd(output: LLMResult) {
          for (const generation of output.generations) {
            for (const gen of generation) {
              console.log(gen.text);
            }
          }

          // todo i should get access to executor.agent.outputparser instead
          let text = output.generations[0][0].text.trim();
          // not very consistent using syntax highlighting
          text = text.includes('```json')
            ? text.split('```json')[1]
            : text.split('```')[1];
          text = text.split('```')[0].trim();
          const action = JSON.parse(text);

          set((state) => {
            state.currentTask.history.push({
              action,
            });
          });
        },
      });

      const controller = new AbortController();

      const openAIApiKey = useAppState.getState().settings.openAIKey || '';
      const modelName = useAppState.getState().settings.selectedModel;
      const model = new ChatOpenAI(
        {
          temperature: 0,
          modelName,
          openAIApiKey,
          callbackManager,
        },
        { baseOptions: { signal: controller.signal } }
      );
      const tools = [
        new DynamicTool({
          name: 'click',
          description:
            'focuses on and sets the value of an input element. input is "elementId")',
          func: async (inputs) => {
            console.log('click', inputs);
            const [elementIdString, _tabId] = inputs.split(',').map((input) => {
              let t = input.trim();
              t = t.startsWith('"') ? t.slice(1) : t;
              t = t.endsWith('"') ? t.slice(0, -1) : t;
              return t.trim();
            });

            const elementId = parseInt(elementIdString);
            if (isNaN(elementId)) {
              return 'elementId was not a number';
            }
            try {
              await click({ elementId });
              return 'clicked';
            } catch (e) {
              if (e) {
                return e.toString();
              }
              return 'click failed for unknown reason';
            }
          },
        }),
        new DynamicTool({
          name: 'setValue',
          description:
            'focuses on and sets the value of an input element. input is "elementId","value")',
          func: async (inputs) => {
            console.log('setValue', inputs);
            const [elementIdString, value, _tabId] = inputs
              .split(',')
              .map((input) => {
                let t = input.trim();
                t = t.startsWith('"') ? t.slice(1) : t;
                t = t.endsWith('"') ? t.slice(0, -1) : t;
                return t.trim();
              });

            const elementId = parseInt(elementIdString);
            if (isNaN(elementId)) {
              return 'elementId was not a number';
            }
            try {
              await setValue({ elementId, value });
              return 'value set';
            } catch (e) {
              if (e) {
                return e.toString();
              }
              return 'setValue failed for unknown reason';
            }
          },
        }),
      ];

      const executor = AgentExecutor.fromAgentAndTools({
        agent: ChatConversationalAgent.fromLLMAndTools(model, tools),
        tools,
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

        const pageDOM = await getSimplifiedDom();

        if (!pageDOM) {
          set((state) => {
            state.currentTask.status = 'error';
          });
        } else {
          const html = pageDOM.outerHTML;
          const domText = templatize(html);

          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 200,
          });
          const texts = await textSplitter.splitText(domText);

          const docs = texts.map(
            (pageContent: string) =>
              new Document({
                pageContent,
                metadata: [],
              })
          );

          const vectorStore = await MemoryVectorStore.fromDocuments(
            docs,
            new OpenAIEmbeddings({ openAIApiKey })
          );
          const results = await vectorStore.similaritySearch(instructions, 4);
          const context = results.map((res) => res.pageContent).join('\n');

          const interval = setInterval(() => {
            if (wasStopped()) {
              // hack to stop agent, just give it no more iterations
              executor.maxIterations = 0;
              // stop the existing call
              controller.abort();
            }
          }, 500);
          setActionStatus('performing-action');
          const result = await executor.call({
            input: instructions,
            domText: context,
          });
          clearInterval(interval);
          result.output;

          set((state) => {
            state.currentTask.status = 'success';
          });
        }
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
