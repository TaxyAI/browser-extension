interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
  durationms: number;
  name: string;
  parentid?: string;
}

interface Span {
  id: string;
  traceid: string;
  timestamp?: number;
  attributes: SpanAttributes;
}

export const sendSpanData = async (
  spans: Span[],
  serviceName: string,
  host: string
) => {
  const apiKey = 'YOUR_LICENSE_KEY';
  const url = 'https://trace-api.newrelic.com/trace/v1';
  const data = [
    {
      common: {
        attributes: {
          'service.name': serviceName,
          host: host,
        },
      },
      spans: spans,
    },
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'Data-Format': 'newrelic',
        'Data-Format-Version': '1',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('Success:', response.statusText);
    } else {
      console.error('Error:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
