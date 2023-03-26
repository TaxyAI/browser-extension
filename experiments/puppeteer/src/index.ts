// import puppeteer

import puppeteer from "puppeteer-extra";
import getAnnotatedDOM from "./getAnnotatedDom";
import fs from "fs/promises";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
  devtools: true,
  args: ["--start-maximized"],
});

// navigate to google
const page = (await browser.pages())[0];
await page.setUserAgent(
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
);

await page.goto("https://unminify.com/");

// Wait for the user to log in
// await page.waitForSelector("div[class='editor-container']", { timeout: 0 });

const textbox = await page.$("textarea#code");
console.log("textbox", textbox);

// Set the text in the textbox to "hi everyone count tokens"
await textbox?.type(`          <div role="presentation" id="74">
            <div>
              1
              <pre
                role="presentation"
                id="78"
              ><span role="presentation" id="79">​ </span></pre>
            </div>
          </div>
`);

// Wait indefinitely
await new Promise((resolve) => setTimeout(resolve, 100000000));

// Save the cookies to a file
// const cookies = await page.cookies();
// console.log(cookies);
// await fs.writeFile("cookies.json", JSON.stringify(cookies));
// console.log("cookies saved");

// Get the DOM

// await page.exposeFunction("getAnnotatedDOM", getAnnotatedDOM);

// const dom = await page.evaluate(() => {
//   try {
//     console.log("in page");
//     console.log("getAnnotatedDOM", getAnnotatedDOM);
//     return getAnnotatedDOM(document.documentElement);
//   } catch (e) {
//     console.log("error", e);
//     debugger;
//   }
// });

console.log(dom);
