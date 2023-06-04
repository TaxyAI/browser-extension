import React from 'react';
import Waterfall, { sampleEvents } from './Waterfall';
import { IWaterfallEvent, useEventStore } from '../state/store';

export default function Analytics() {
  const [selectedEventIndex, setSelectedEventIndex] = React.useState<
    number | null
  >(null);

  // FOR FRONTEND DEV PURPOSES ONLY
  const events = useEventStore.getState().events;

  return (
    <div className="mt-4">
      <Waterfall setSelectedEventIndex={setSelectedEventIndex} />
      <div className="mt-4 h-full w-full bg-gray-100 flex flex-col items-center justify-center">
        {selectedEventIndex !== null
          ? events[selectedEventIndex].eventInput
          : 'Select an event to view its details'}
      </div>
    </div>
  );
}
