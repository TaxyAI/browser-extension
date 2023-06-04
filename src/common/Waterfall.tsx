import React from 'react';
import WaterfallBar from './WaterfallBar';

export interface IEvent {
  id: number;
  start: number;
  finish?: number;
}

export default function Waterfall() {
  const [events, setEvents] = React.useState<IEvent[]>([]);
  const [currentBarWidth, setCurrentBarWidth] = React.useState<number>(100);
  const [isGrowing, setIsGrowing] = React.useState<boolean>(false);
  const [currentEventId, setCurrentEventId] = React.useState<number>(0);
  const [now, setNow] = React.useState<number | null>(null);

  // let barWidth = 100;

  const startEvent = () => {
    console.log(events);
    setEvents((events) => [
      ...events,
      { id: currentEventId, start: Date.now() },
    ]);
    setIsGrowing(true);
  };

  const endEvent = () => {
    const updatedEvents = events.map((event) => {
      if (event.id === currentEventId) {
        return {
          ...event,
          finish: Date.now(),
        };
      } else {
        return { ...event };
      }
    });
    setEvents(updatedEvents);
    setCurrentEventId((id) => id + 1);
  };

  const calcWidth = (event: IEvent) => {
    if (event.finish) {
      return (event.finish - event.start) / 100;
    } else {
      return (Date.now() - event.start) / 100;
    }
  };

  return (
    <>
      <button className="border border-gray-400" onClick={startEvent}>
        Start event
      </button>
      <button className="border border-gray-400" onClick={endEvent}>
        End event
      </button>
      {events.map((event, index) => {
        console.log(index);
        return <WaterfallBar index={index} event={event} />;
      })}
    </>
  );
}
