import React, { useEffect } from 'react';
import { IEvent } from './Waterfall';

export default function WaterfallBar({
  event,
  index,
}: {
  event: IEvent;
  index: number;
}) {
  const [currentBarWidth, setCurrentBarWidth] = React.useState<number>(100);
  const [now, setNow] = React.useState(null);

  if (event.finish) {
    setCurrentBarWidth((event.finish - event.start) / 100);
  }

  useEffect(() => {
    const barInterval = setInterval(() => {
      if (!event.finish) {
        console.log(currentBarWidth);
        setCurrentBarWidth((width) => width + 1);
      }
    }, 100);
    return () => clearInterval(barInterval);
  }, [event]);

  const calcWidth = (event: IEvent) => {
    if (event.finish) {
      return (event.finish - event.start) / 100;
    } else {
      return (Date.now() - event.start) / 100;
    }
  };

  return (
    <div
      className="h-4 bg-red-300"
      key={index}
      style={{ width: event.finish ? calcWidth(event) : currentBarWidth }}
    ></div>
  );
}
