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
    if (event.finish) {
      setCurrentBarWidth((event.finish - event.start) / 100);
    }
    const barInterval = setInterval(() => {
      if (!event.finish) {
        console.log(currentBarWidth);
        setCurrentBarWidth((width) => width + 1);
      }
    }, 100);
    return () => clearInterval(barInterval);
  }, [event.finish]);

  const barWidth = 100;

  return (
    <div
      className="h-4 bg-red-300"
      key={index}
      style={{ width: currentBarWidth }}
    ></div>
  );
}
