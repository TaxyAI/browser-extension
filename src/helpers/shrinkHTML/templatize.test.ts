import { test } from '@jest/globals';
import templatize from './templatize';

type TestCases = [string, string][];

const sample = `
<body>
<div>
<a id="1242"></a>
<div>
  <div>
    Lopez Island, Washington On the beach Sep 17 – 22 $350 per night
    <span aria-label="5.0 out of 5 average rating"></span>
  </div>
  <div>
    <button
      aria-label="Add to wishlist: Lopez Island, Washington"
      type="button"
      id="1272"
    ></button>
    <div aria-label="Photo 1 of 6"></div>
  </div>
</div>
</div>
<div>
<a id="1366"></a>
<div>
  <div>
    Brinnon, Washington On the beach Apr 22 – 28 $317 per night
    <span aria-label="4.97 out of 5 average rating"></span>
  </div>
  <div>
    <button
      aria-label="Add to wishlist: Brinnon, Washington"
      type="button"
      id="1396"
    ></button>
    <div aria-label="Photo 1 of 6"></div>
  </div>
</div>
</div>
<div>
<a id="1490"></a>
<div>
  <div>
    Lopez Island, Washington On the beach Aug 8 – 14 $534 per night
    <span aria-label="4.9 out of 5 average rating"></span>
  </div>
  <div>
    <button
      aria-label="Add to wishlist: Lopez Island, Washington"
      type="button"
      id="1520"
    ></button>
    <div aria-label="Photo 1 of 6"></div>
  </div>
</div>
</div>
<div>
<a id="1614"></a>
<div>
  <div>
    Camano, Washington On the beach Jun 1 – 6 $910 per night
    <span aria-label="4.72 out of 5 average rating"></span>
  </div>
  <div>
    <button
      aria-label="Add to wishlist: Camano, Washington"
      type="button"
      id="1644"
    ></button>
    <div aria-label="Photo 1 of 6"></div>
  </div>
</div>
</body>
`;

// test('templatize', () => {
//   const out = templatize(sample);
//   console.log('in length', sample.length);
//   console.log('out length', out.length);
//   console.log(out);
//   expect(templatize(sample)).toBe(``);
// });

test('templatize', () => {
  // const dom = new DOMParser().parseFromString(sample, 'text/html');

  const out = templatize(sample);
  // const out = templatize(dom.documentElement);
  console.log(out);
});
