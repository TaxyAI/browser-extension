import React, { useEffect } from 'react';
import { useStore } from 'zustand'
import { useEventStore } from '../state/store'

const eventTypes = ['parsingDOM', 'determineNextAction', 'domAction', 'fail'];
export interface IEvent {
  id: number;
  start: number;
  finish?: number;
  xOffSet?: number;
  eventType: string;
}

const pixelPerMs = 0.02;
const barWidthUpdateInterval = 10;

export default function Waterfall() {
  const [events, setEvents] = React.useState<IEvent[]>([]);
  const [currentBarWidth, setCurrentBarWidth] = React.useState<number>(0);
  const [isGrowing, setIsGrowing] = React.useState<boolean>(false);
  const [currentEventId, setCurrentEventId] = React.useState<number>(0);
  const [xOffset, setXOffset] = React.useState<number>(0);

  const storedEvents = useEventStore.getState().events

  useEffect(() => {
    console.log(storedEvents);
  }, [storedEvents]);


  const startEvent = () => {
    setEvents((events) => [
      ...events,
      {
        id: currentEventId,
        start: Date.now(),
        xOffSet: xOffset,
        eventType: 'click',
      },
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
      return (event.finish - event.start) * pixelPerMs;
    } else {
      return (Date.now() - event.start) * pixelPerMs;
    }
  };

  useEffect(() => {
    const barInterval = setInterval(() => {
      if (isGrowing) {
        console.log(currentBarWidth);
        setCurrentBarWidth(
          (width) => width + pixelPerMs * barWidthUpdateInterval
        );
      }
    }, barWidthUpdateInterval);
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
      {/* Waterfall chart */}
      <div className="h-[315px] mt-4 overflow-scroll relative">
        {/* Gridlines */}
        <div className="h-full flex flex-row">
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">5 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">10 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">15 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">20 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">25 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">30 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">35 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">40 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">45 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">50 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">55 s</small>
          </div>
          <div className="h-full w-[100px] shrink-0 border-r border-gray-100">
            <small className=" float-right mr-1 mt-1 text-gray-400">
              1m 0s
            </small>
          </div>
        </div>
        {/* Bars */}
        <div className="h-[315px] absolute top-7 left-0">
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
        </div>
      </div>
    </>
  );
}
