// import puppeteer

import puppeteer from "puppeteer";
import getAnnotatedDOM from "./getAnnotatedDom";

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
  devtools: true,
  args: ["--start-maximized"],
});

// navigate to google
const page = (await browser.pages())[0];
await page.goto("https://google.com");

console.log("getAnnotatedDOM", getAnnotatedDOM);

// Get the DOM

// Open devtools

await page.exposeFunction("getAnnotatedDOM", getAnnotatedDOM);

const dom = await page.evaluate(() => {
  try {
    console.log("in page");
    console.log("getAnnotatedDOM", getAnnotatedDOM);
    return getAnnotatedDOM(document.documentElement);
  } catch (e) {
    console.log("error", e);
    debugger;
  }
});

console.log(dom);
