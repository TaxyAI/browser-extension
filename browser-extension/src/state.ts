import { useState, useEffect, useCallback } from 'react';

export const OPENAI_KEY = 'openai-key';
export const SELECTED_OPENAI_MODEL = 'selected-openai-model';
export const MOST_RECENT_QUERY = 'most-recent-query';

type StoredTypes = {
  [OPENAI_KEY]: string;
  [SELECTED_OPENAI_MODEL]: string;
  [MOST_RECENT_QUERY]: string;
};

export function useSyncStorage<T extends keyof StoredTypes>(
  key: T,
  initialValue: StoredTypes[T] | null = null
) {
  type Value = StoredTypes[T];

  const [state, setState] = useState<Value | null>(initialValue);

  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      setState(result[key]);
    });
  }, [key]);

  const setItem = useCallback(
    (value: Value) => {
      console.log('value', value);
      chrome.storage.sync.set({ [key]: value }, () => {
        setState(value);
      });
    },
    [key]
  );

  // Watch for changes to the key
  useEffect(() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes[key]) {
        setState(changes[key].newValue);
      }
    });
  }, [key]);

  return [state, setItem] as const;
}

export async function getValueFromStorage<T extends keyof StoredTypes>(
  key: T,
  initialValue: StoredTypes[T] | null = null
): Promise<StoredTypes[T] | null> {
  // return result from chrome storage
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key] || initialValue);
    });
  });
}
