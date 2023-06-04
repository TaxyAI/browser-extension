import React, { useState, useEffect } from 'react';
import { Textarea } from '@chakra-ui/react';
import {
  Configuration,
  CreateCompletionResponseUsage,
  OpenAIApi,
} from 'openai';
import { useAppState } from '../state/store';

export default function Search() {
  const [query, setQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [currentSearch, setCurrentSearch] = useState<number>(0);
  const [tasks, setTasks] = useState<any[]>([]);

  
  const model = useAppState.getState().settings.selectedModel;
  const key = useAppState.getState().settings.openAIKey;

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: key,
    })
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      search(query);
    }
  };

  useEffect(() => {
    setCurrentSearch((currentSearch) => currentSearch + 1);
  }, [searching]);

  const search = async (query: string) => {
    const searchId = currentSearch + 1;
    setSearching(true);
    setTimeout(() => {
      if (searching && searchId === currentSearch) {
        setSearching(false);
      }
    }, 1000);

    const result = await fetch(`http://127.0.0.1:8000/?query=${query}`, {
      method: 'GET',
    });

    if (result.ok) {
      let data = await result.json();
      data = JSON.parse(data);
      console.log(data);
      setTasks(data.map(async (task: any) => {
        if (task.length == 0) {
          return null;
        }

        const finishTask = task.filter((event: any) => event.event_name == "FinishTask")[0];
        let title = 'Completed task';

        try {
          const completion = await openai.createChatCompletion({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'Summarize the user\'s task history into a title with 5 words or less.',
              },
              {
                role: 'user',
                content: finishTask.prompt,
              },
            ],
            max_tokens: 100,
            temperature: 0,
          });
    
          title = completion.data.choices[0].message?.content?.trim() || title;
        } catch (error: any) {
        }

        console.log(title);

        return {
          title,
          task,
        }
      }).filter((task) => task != null));
      
    }

    setSearching(false);
  };

  return (
    <div className="h-[100px] mt-4 relative">
      <Textarea
        autoFocus
        placeholder="Search for past tasks"
        value={query}
        disabled={searching}
        onChange={(e) => setQuery(e.target.value)}
        mb={1}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
