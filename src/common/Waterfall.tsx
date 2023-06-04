import React, { useEffect } from 'react';
import { IWaterfallEvent } from '../state/store';
import clsx from 'clsx';

// FOR FRONTEND DEV PURPOSES ONLY
const sampleEvents: IWaterfallEvent[] = [
  {
    eventInput: 'StartTask',
    eventProperties: {
      instructions: 'book a flight from sfo to lax',
      site: 'chrome-extension://jiemilonejojilpkjcdlmppjbnefbagn/panel.html',
    },
    start: 28091.299999952316,
    elapsed: 0.5999999046325684,
    finished: 28091.89999985695,
  },
  {
    eventInput: 'ProcessDOM',
    eventProperties: {
      actionId: 'dfcd1fec-4bfe-4ac5-98d3-f41d8f45be99',
    },
    start: 28091.89999985695,
    elapsed: 69,
    finished: 28160.89999985695,
  },
  {
    eventInput: 'DetermineAction',
    eventProperties: {
      actionId: 'dfcd1fec-4bfe-4ac5-98d3-f41d8f45be99',
    },
    start: 28160.89999985695,
    elapsed: 3242.2000000476837,
    finished: 31403.099999904633,
  },
  {
    eventInput: 'PerformAction',
    eventProperties: {
      actionId: 'dfcd1fec-4bfe-4ac5-98d3-f41d8f45be99',
      usage: {
        prompt_tokens: 739,
        completion_tokens: 24,
        total_tokens: 763,
      },
      prompt:
        'The user requests the following task:\n\nbook a flight from sfo to lax\n\n\n\nCurrent time: 03/06/2023, 23:40:15\n\nCurrent page contents:\n\n\n<html><head/><body><div><div><a id="29">About </a><a id="30">Store </a><div><div><a aria-label="Gmail (opens a new tab)" id="37">Gmail </a><a aria-label="Search for Images (opens a new tab)" id="39">Images </a></div><div><a aria-label="Google apps" role="button" id="44"><svg id="45"><path id="46"/></svg></a><a aria-label="Google Account: Eugene Chan  \n(eugenechantk@gmail.com)" role="button" id="49"><div id="50"><svg id="51"><path id="52"/><path id="53"/><path id="54"/><path id="55"/></svg></div></a></div></div></div><form role="search" id="94"><div><div><textarea aria-label="Search" name="q" type="search" value="" role="combobox" title="Search" id="110"/><div><div id="115"/><div aria-label="Search by voice" role="button" id="122"><svg id="123"><path id="124"/><path id="125"/><path id="126"/><path id="127"/></svg></div><div aria-label="Search by image" role="button" id="129"><svg id="130"><rect id="131"/><g id="132"><circle id="133"/><circle id="134"/><path id="135"/><path id="136"/><path id="137"/></g></svg></div></div></div><center><input aria-label="Google Search" name="btnK" type="submit" value="Google Search" role="button" id="235"/><input aria-label="I\'m Feeling Lucky" name="btnI" type="submit" value="I\'m Feeling Lucky" role="button" id="236"/></center></div></form><div><div><a id="270">Advertising </a><a id="271">Business </a><a id="272"> How Search works  </a></div><a id="274"><img id="275"/><span id="276">Carbon neutral since 2007 </span></a><div><a id="278">Privacy </a><a id="279">Terms </a><div role="button" id="285"><div id="286">Settings </div></div></div></div></div></body></html>',
      response:
        '<Thought>I should search for a flight booking website</Thought>\n<Action>setValue(110, "flight booking website")</Action>',
      parsedResponse: {
        thought: 'I should search for a flight booking website',
        action: 'setValue(110, "flight booking website")',
        parsedAction: {
          name: 'setValue',
          args: {
            elementId: 110,
            value: 'flight booking website',
          },
        },
      },
    },
    start: 31403.099999904633,
    elapsed: 4696.200000047684,
    finished: 36099.299999952316,
  },
  {
    eventInput: 'FinishAction',
    eventProperties: {
      actionId: 'dfcd1fec-4bfe-4ac5-98d3-f41d8f45be99',
      action: 'setValue',
    },
    start: 36099.299999952316,
    elapsed: 2005.5,
    finished: 38104.799999952316,
  },
  {
    eventInput: 'ProcessDOM',
    eventProperties: {
      actionId: '244b680c-cf65-4779-b576-b37829fbd779',
    },
    start: 38104.799999952316,
    elapsed: 46.799999952316284,
    finished: 38151.59999990463,
  },
  {
    eventInput: 'DetermineAction',
    eventProperties: {
      actionId: '244b680c-cf65-4779-b576-b37829fbd779',
    },
    start: 38151.59999990463,
    elapsed: 3410.2999999523163,
    finished: 41561.89999985695,
  },
  {
    eventInput: 'PerformAction',
    eventProperties: {
      actionId: '244b680c-cf65-4779-b576-b37829fbd779',
      usage: {
        prompt_tokens: 1244,
        completion_tokens: 33,
        total_tokens: 1277,
      },
      prompt:
        'The user requests the following task:\n\nbook a flight from sfo to lax\n\nYou have already taken the following actions: \n<Thought>I should search for a flight booking website</Thought>\n<Action>setValue(110, "flight booking website")</Action>\n\n\n\nCurrent time: 03/06/2023, 23:40:25\n\nCurrent page contents:\nT1: <li role="presentation" id=$1><div aria-label=$2 role="option" id=$3><div role="presentation" id=$4><span>$5</span></div></div></li>\n\n<html><head/><body><div><div><a id="29">About </a><a id="30">Store </a><div><div><a aria-label="Gmail (opens a new tab)" id="37">Gmail </a><a aria-label="Search for Images (opens a new tab)" id="39">Images </a></div><div><a aria-label="Google apps" role="button" id="44"><svg id="45"><path id="46"/></svg></a><a aria-label="Google Account: Eugene Chan  \n(eugenechantk@gmail.com)" role="button" id="49"><div id="50"><svg id="51"><path id="52"/><path id="53"/><path id="54"/><path id="55"/></svg></div></a></div></div></div><form role="search" id="94"><div><div><textarea aria-label="Search" name="q" type="search" value="" role="combobox" title="Search" id="110"/><div><div id="115"><div aria-label=" Clear" role="button" id="116"><span id="117"><svg id="118"><path id="119"/></svg></span></div><span id="120"/></div><div aria-label="Search by voice" role="button" id="122"><svg id="123"><path id="124"/><path id="125"/><path id="126"/><path id="127"/></svg></div><div aria-label="Search by image" role="button" id="129"><svg id="130"><rect id="131"/><g id="132"><circle id="133"/><circle id="134"/><path id="135"/><path id="136"/><path id="137"/></g></svg></div></div></div><div><div><div role="presentation" id="143"><div role="presentation" id="145"><ul role="listbox" id="146">{T1(147,"flight booking websites",157,158,"flight booking website s ")}{T1(178,"flight booking websites in india",188,189,"flight booking website s in india ")}{T1(209,"flight booking websites usa",219,220,"flight booking website s usa ")}{T1(240,"flight booking website cheapest",250,251,"flight booking website  cheapest ")}{T1(271,"flight booking website template",281,282,"flight booking website  template ")}{T1(302,"flight booking websites australia",312,313,"flight booking website s australia ")}{T1(333,"flight booking websites canada",343,344,"flight booking website s canada ")}{T1(364,"flight booking websites germany",374,375,"flight booking website s germany ")}{T1(395,"flight booking website uae",405,406,"flight booking website  uae ")}{T1(426,"flight booking websites in nigeria",436,437,"flight booking website s in nigeria ")}</ul></div><div role="presentation" id="457"/></div><div role="presentation" id="461"><div role="presentation" id="462"/></div><center><input aria-label="Google Search" name="btnK" type="submit" value="Google Search" role="button" id="511"/><input aria-label="I\'m Feeling Lucky" name="btnI" type="submit" value="I\'m Feeling Lucky" id="512"/></center></div><a aria-label="Give feedback on this result" role="button" id="518">Report inappropriate predictions </a></div><center><input aria-label="Google Search" name="btnK" type="submit" value="Google Search" role="button" id="547"/><input aria-label="I\'m Feeling Lucky" name="btnI" type="submit" value="I\'m Feeling Lucky" role="button" id="548"/></center></div></form><div><div><a id="582">Advertising </a><a id="583">Business </a><a id="584"> How Search works  </a></div><a id="586"><img id="587"/><span id="588">Carbon neutral since 2007 </span></a><div><a id="590">Privacy </a><a id="591">Terms </a><div role="button" id="597"><div id="598">Settings </div></div></div></div></div></body></html>',
      response:
        '<Thought>I should search for a flight from SFO to LAX</Thought>\n<Action>setValue(110, "SFO to LAX flight booking website")</Action>',
      parsedResponse: {
        thought: 'I should search for a flight from SFO to LAX',
        action: 'setValue(110, "SFO to LAX flight booking website")',
        parsedAction: {
          name: 'setValue',
          args: {
            elementId: 110,
            value: 'SFO to LAX flight booking website',
          },
        },
      },
    },
    start: 41561.89999985695,
    elapsed: 6034.900000095367,
    finished: 47596.799999952316,
  },
  {
    eventInput: 'FinishAction',
    eventProperties: {
      actionId: '244b680c-cf65-4779-b576-b37829fbd779',
      action: 'setValue',
    },
    start: 47596.799999952316,
    elapsed: 2003.8999998569489,
    finished: 49600.699999809265,
  },
  {
    eventInput: 'ProcessDOM',
    eventProperties: {
      actionId: 'd2ece1d0-ffea-4916-833a-70ac88e2ef36',
    },
    start: 49600.699999809265,
    elapsed: 36.700000047683716,
    finished: 49637.39999985695,
  },
  {
    eventInput: 'DetermineAction',
    eventProperties: {
      actionId: 'd2ece1d0-ffea-4916-833a-70ac88e2ef36',
    },
    start: 49637.39999985695,
    elapsed: 3501.7999999523163,
    finished: 53139.199999809265,
  },
  {
    eventInput: 'PerformAction',
    eventProperties: {
      actionId: 'd2ece1d0-ffea-4916-833a-70ac88e2ef36',
      usage: {
        prompt_tokens: 853,
        completion_tokens: 33,
        total_tokens: 886,
      },
      prompt:
        'The user requests the following task:\n\nbook a flight from sfo to lax\n\nYou have already taken the following actions: \n<Thought>I should search for a flight booking website</Thought>\n<Action>setValue(110, "flight booking website")</Action>\n\n<Thought>I should search for a flight from SFO to LAX</Thought>\n<Action>setValue(110, "SFO to LAX flight booking website")</Action>\n\n\n\nCurrent time: 03/06/2023, 23:40:36\n\nCurrent page contents:\n\n\n<html><head/><body><div><div><a id="29">About </a><a id="30">Store </a><div><div><a aria-label="Gmail (opens a new tab)" id="37">Gmail </a><a aria-label="Search for Images (opens a new tab)" id="39">Images </a></div><div><a aria-label="Google apps" role="button" id="44"><svg id="45"><path id="46"/></svg></a><a aria-label="Google Account: Eugene Chan  \n(eugenechantk@gmail.com)" role="button" id="49"><div id="50"><svg id="51"><path id="52"/><path id="53"/><path id="54"/><path id="55"/></svg></div></a></div></div></div><form role="search" id="94"><div><div><textarea aria-label="Search" name="q" type="search" value="" role="combobox" title="Search" id="110"/><div><div id="115"><div aria-label=" Clear" role="button" id="116"><span id="117"><svg id="118"><path id="119"/></svg></span></div><span id="120"/></div><div aria-label="Search by voice" role="button" id="122"><svg id="123"><path id="124"/><path id="125"/><path id="126"/><path id="127"/></svg></div><div aria-label="Search by image" role="button" id="129"><svg id="130"><rect id="131"/><g id="132"><circle id="133"/><circle id="134"/><path id="135"/><path id="136"/><path id="137"/></g></svg></div></div></div><center><input aria-label="Google Search" name="btnK" type="submit" value="Google Search" role="button" id="268"/><input aria-label="I\'m Feeling Lucky" name="btnI" type="submit" value="I\'m Feeling Lucky" role="button" id="269"/></center></div></form><div><div><a id="303">Advertising </a><a id="304">Business </a><a id="305"> How Search works  </a></div><a id="307"><img id="308"/><span id="309">Carbon neutral since 2007 </span></a><div><a id="311">Privacy </a><a id="312">Terms </a><div role="button" id="318"><div id="319">Settings </div></div></div></div></div></body></html>',
      response:
        '<Thought>I should search for a flight from SFO to LAX</Thought>\n<Action>setValue(110, "SFO to LAX flight booking website")</Action>',
      parsedResponse: {
        thought: 'I should search for a flight from SFO to LAX',
        action: 'setValue(110, "SFO to LAX flight booking website")',
        parsedAction: {
          name: 'setValue',
          args: {
            elementId: 110,
            value: 'SFO to LAX flight booking website',
          },
        },
      },
    },
    start: 53139.199999809265,
    elapsed: 6183.800000190735,
    finished: 59323,
  },
  {
    eventInput: 'CancelTask',
    eventProperties: {
      actionId: 'd2ece1d0-ffea-4916-833a-70ac88e2ef36',
    },
    start: 59323,
    elapsed: 1,
    finished: 59324,
  },
  {
    eventInput: 'FinishTask',
    eventProperties: {
      usage: {
        prompt_tokens: 853,
        completion_tokens: 33,
        total_tokens: 886,
      },
      prompt:
        'The user requests the following task:\n\nbook a flight from sfo to lax\n\nYou have already taken the following actions: \n<Thought>I should search for a flight booking website</Thought>\n<Action>setValue(110, "flight booking website")</Action>\n\n<Thought>I should search for a flight from SFO to LAX</Thought>\n<Action>setValue(110, "SFO to LAX flight booking website")</Action>\n\n\n\nCurrent time: 03/06/2023, 23:40:36\n\nCurrent page contents:\n\n\n<html><head/><body><div><div><a id="29">About </a><a id="30">Store </a><div><div><a aria-label="Gmail (opens a new tab)" id="37">Gmail </a><a aria-label="Search for Images (opens a new tab)" id="39">Images </a></div><div><a aria-label="Google apps" role="button" id="44"><svg id="45"><path id="46"/></svg></a><a aria-label="Google Account: Eugene Chan  \n(eugenechantk@gmail.com)" role="button" id="49"><div id="50"><svg id="51"><path id="52"/><path id="53"/><path id="54"/><path id="55"/></svg></div></a></div></div></div><form role="search" id="94"><div><div><textarea aria-label="Search" name="q" type="search" value="" role="combobox" title="Search" id="110"/><div><div id="115"><div aria-label=" Clear" role="button" id="116"><span id="117"><svg id="118"><path id="119"/></svg></span></div><span id="120"/></div><div aria-label="Search by voice" role="button" id="122"><svg id="123"><path id="124"/><path id="125"/><path id="126"/><path id="127"/></svg></div><div aria-label="Search by image" role="button" id="129"><svg id="130"><rect id="131"/><g id="132"><circle id="133"/><circle id="134"/><path id="135"/><path id="136"/><path id="137"/></g></svg></div></div></div><center><input aria-label="Google Search" name="btnK" type="submit" value="Google Search" role="button" id="268"/><input aria-label="I\'m Feeling Lucky" name="btnI" type="submit" value="I\'m Feeling Lucky" role="button" id="269"/></center></div></form><div><div><a id="303">Advertising </a><a id="304">Business </a><a id="305"> How Search works  </a></div><a id="307"><img id="308"/><span id="309">Carbon neutral since 2007 </span></a><div><a id="311">Privacy </a><a id="312">Terms </a><div role="button" id="318"><div id="319">Settings </div></div></div></div></div></body></html>',
      response:
        '<Thought>I should search for a flight from SFO to LAX</Thought>\n<Action>setValue(110, "SFO to LAX flight booking website")</Action>',
    },
    start: 59324,
    elapsed: null,
    finished: null,
  },
];

const pixelPerMs = 0.02;
const barWidthUpdateInterval = 10;

export default function Waterfall() {
  const [startTime, setStartTime] = React.useState<number>(0);
  const [currentBarWidth, setCurrentBarWidth] = React.useState<number>(0);
  const [isGrowing, setIsGrowing] = React.useState<boolean>(false);
  const waterfallChartRef = React.useRef<HTMLDivElement>(null);

  // const storedEvents = useEventStore.getState().events;
  // FOR FRONTEND DEV PURPOSES ONLY
  const storedEvents = sampleEvents;

  useEffect(() => {
    console.log('Events fetched from Zustand', storedEvents);
    if (storedEvents.length > 0) {
      startTime === 0 && setStartTime(storedEvents[0].start);
      storedEvents.length > 11 &&
        waterfallChartRef.current?.scrollBy({ top: 24 });
      if (storedEvents[storedEvents.length - 1].finished) {
        setIsGrowing(false);
      } else {
        setIsGrowing(false);
      }
    }
  }, [storedEvents]);

  const calcWidth = (event: IWaterfallEvent) => {
    if (event.finished) {
      return (event.finished - event.start) * pixelPerMs;
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
        // Scroll to the right if the last bar is about to go out of view
        if (
          storedEvents[storedEvents.length - 1].start +
            pixelPerMs * barWidthUpdateInterval >
          315
        ) {
          waterfallChartRef.current?.scrollBy({
            left: pixelPerMs * barWidthUpdateInterval,
          });
        }
      }
    }, barWidthUpdateInterval);
    return () => clearInterval(barInterval);
  }, [isGrowing]);

  return (
    <>
      {/* Waterfall chart */}
      <div
        ref={waterfallChartRef}
        className="h-[320px] mt-4 overflow-scroll relative"
      >
        {/* Time labels */}
        <div className="flex flex-row top-0 sticky">
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">5 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">10 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">15 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">20 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">25 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">30 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">35 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">40 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">45 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">50 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">55 s</small>
          </div>
          <div className="w-[100px] shrink-0">
            <small className="text-gray-400 float-right pr-2 pt-1">1m 0s</small>
          </div>
        </div>
        {/* Bars */}
        <div className=" h-max relative">
          {/* Gridlines */}
          <div className="h-full flex flex-row absolute top-0 left-0">
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
            <div className="h-full w-[100px] shrink-0 border-r border-gray-100"></div>
          </div>
          {/* Waterfall Bars */}
          <div className="pt-7">
            {storedEvents.length > 0 &&
              storedEvents.map((event, index) => {
                console.log(startTime);
                const barWidth = event.finished
                  ? calcWidth(event)
                  : currentBarWidth;
                return (
                  <button
                    className={clsx(
                      'h-6 rounded-[4px] cursor-pointer block focus:outline-offset-2 focus:outline focus:outline-2',
                      event.eventInput === 'ProcessDOM'
                        ? 'bg-sky-300 hover:bg-sky-400 focus:outline-sky-400'
                        : event.eventInput === 'DetermineAction'
                        ? 'bg-blue-300 hover:bg-blue-400 focus:outline-blue-400'
                        : event.eventInput === 'PerformAction'
                        ? 'bg-blue-500 hover:bg-blue-600 focus:outline-blue-600'
                        : 'bg-gray-200 hover:bg-gray-300 focus:outline-gray-300'
                    )}
                    key={index}
                    style={{
                      position: 'relative',
                      width: barWidth,
                      left: (event.start - startTime) * pixelPerMs,
                    }}
                  ></button>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
