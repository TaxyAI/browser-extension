import React, { useState, useEffect } from 'react';
import { Textarea } from '@chakra-ui/react';

export default function Search() {
  const [query, setQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [currentSearch, setCurrentSearch] = useState<number>(0);

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

    if (searching === false) {
      return;
    }

    if (result.ok) {
      const data = await result.json();
      console.log(data);
    }
  };

  return (
    <div className="h-[315px] mt-4 relative">
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
