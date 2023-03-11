import { useState, useEffect, useCallback } from 'react';

export const OPENAI_KEY = 'openai-key';

type StoredTypes = {
  [OPENAI_KEY]: string;
};

export function useSyncStorage<T extends keyof StoredTypes>(key: T) {
  type Value = StoredTypes[T];

  const [state, setState] = useState<Value | null>(null);

  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      setState(result[key]);
    });
  }, [key]);

  const setItem = useCallback(
    (value: Value) => {
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
