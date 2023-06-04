import React, { useEffect } from 'react';

export interface IEvent {
  id: number;
  start: number;
  finish?: number;
  xOffSet?: number;
}

export default function Waterfall() {
  const [events, setEvents] = React.useState<IEvent[]>([]);
  const [currentBarWidth, setCurrentBarWidth] = React.useState<number>(0);
  const [isGrowing, setIsGrowing] = React.useState<boolean>(false);
  const [currentEventId, setCurrentEventId] = React.useState<number>(0);
  const [xOffset, setXOffset] = React.useState<number>(0);

  const startEvent = () => {
    setEvents((events) => [
      ...events,
      { id: currentEventId, start: Date.now(), xOffSet: xOffset },
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
    console.log(updatedEvents);
    setEvents(updatedEvents);
    setIsGrowing(false);
    setCurrentEventId((id) => id + 1);
    setCurrentBarWidth(0);
    setXOffset((offset) => offset + calcWidth(events[events.length - 1]));
  };

  const calcWidth = (event: IEvent) => {
    if (event.finish) {
      return (event.finish - event.start) / 100;
    } else {
      return (Date.now() - event.start) / 100;
    }
  };

  useEffect(() => {
    const barInterval = setInterval(() => {
      if (isGrowing) {
        console.log(currentBarWidth);
        setCurrentBarWidth((width) => width + 1);
      }
    }, 100);
    return () => clearInterval(barInterval);
  }, [isGrowing]);

  return (
    <>
      <button className="border border-gray-400" onClick={startEvent}>
        Start event
      </button>
      <button className="border border-gray-400" onClick={endEvent}>
        End event
      </button>
      {events.map((event, index) => {
        // return <WaterfallBar index={index} event={event} />;
        console.log(xOffset);
        return (
          <div
            className="h-4 bg-red-300"
            key={index}
            style={{
              position: 'relative',
              width: event.finish ? calcWidth(event) : currentBarWidth,
              left: event.xOffSet,
            }}
          ></div>
        );
      })}
    </>
  );
}
