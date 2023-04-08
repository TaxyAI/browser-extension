<img src="src/assets/img/icon-128.png" width="64"/>

# Taxy AI: Full Browser Automation
[Waitlist](https://docs.google.com/forms/d/e/1FAIpQLScAFKI1fZ1cXhBmSp2HM93Jvuc8Jvrxh5iSbkKhtwKN-OHoTQ/viewform) | [Discord](https://discord.gg/DXaErbBc)

Taxy uses GPT-4 to control your browser and perform repetitive actions on your behalf. Currently it allows you to define ad-hoc instructions. In the future it will also support saved and scheduled workflows.

Taxy's current status is **research preview**. Many workflows fail or confuse the agent. If you'd like to hack on Taxy to make it better or test it on your own workflows, follow the instructions below to run it locally. If you'd like to know once it's available for wider usage, you can sign up for our [waitlist](https://docs.google.com/forms/d/e/1FAIpQLScAFKI1fZ1cXhBmSp2HM93Jvuc8Jvrxh5iSbkKhtwKN-OHoTQ/viewform).

Taxy is fully open-source, and we don't send any page contents or instructions to our servers.

Here's Taxy using Google Calendar with the prompt "Schedule standup tomorrow at 10am. Invite david@taxy.ai"

![calendar](https://user-images.githubusercontent.com/176426/228092695-1bc11ea9-bfb7-470d-bbc6-0026e93c23c3.gif)


## Table of Contents

- [Taxy AI: Full Browser Automation](#taxy-ai-full-browser-automation)
  - [Table of Contents](#table-of-contents)
  - [Installing and Running](#installing-and-running)
    - [Installing the extension](#installing-the-extension)
    - [Running in your browser](#running-in-your-browser)
  - [How it Works - The Action Cycle](#how-it-works---the-action-cycle)
  - [Simple Demos](#simple-demos)
    - [Protecting the main branch in GitHub](#protecting-the-main-branch-in-github)
    - [Searching for and playing the movie Oblivion in Netflix](#searching-for-and-playing-the-movie-oblivion-in-netflix)
    - [Creating a calendar event](#creating-a-calendar-event)
    - [Writing an essay in the OpenAI playground](#writing-an-essay-in-the-openai-playground)
    - [Add your own!](#add-your-own)
  - [Tech Stack](#tech-stack)
  - [Resources](#resources)

## Installing and Running

Currently this extension is only available through this GitHub repo. We'll release it on the Chrome Web Store after adding features to increase its usability for a non-technical audience. To build and install the extension locally on your machine, follow the instructions below.

### Installing the extension

1. Ensure you have [Node.js](https://nodejs.org/) >= **16**.
2. Clone this repository
3. Run `yarn` to install the dependencies
4. Run `yarn start` to build the package
5. Load your extension on Chrome by doing the following:
   1. Navigate to `chrome://extensions/`
   2. Toggle `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder that `yarn start` generated

### Running in your browser

1. Once installed, the browser plugin will be available in two forms:
   1. As a Popup. Activate by pressing `cmd+shift+y` on mac or `ctrl+shift+y` on windows/linux, or by clicking the extension logo in your browser.
   2. As a devtools panel. Activate by first opening the browser's developer tools, then navigating to the `Taxy AI` panel.
2. The next thing you need to do is create or access an existing [OpenAI API Key](https://platform.openai.com/account/api-keys) and paste it in the provided box. This key will be stored securely in your browser, and will not be uploaded to a third party.
3. Finally, navigate to a webpage you want Taxy to act upon (for instance the [OpenAI playground](https://platform.openai.com/playground)) and start experimenting!

## How it Works - The Action Cycle

1. Taxy runs a content script on the webpage to pull the entire DOM. It simplifies the html it receives to only include interactive or semantically important elements, like buttons or text. It assigns an id to each interactive element. It then "templatizes" the DOM to reduce the token count even further.
2. Taxy sends the simplified DOM, along with the user's instructions, to a selected LLM (currently GPT-3.5 and GPT-4 are supported). Taxy informs the LLM of two methods to interact with the webpage:
   1. `click(id)` - click on the interactive element associated with that id
   2. `setValue(id, text)` - focus on a text input, clear its existing text, and type the specified text into that input
3. When Taxy gets a completion from the LLM, it parses the response for an action. The action cycle will end at this stage if any of the following conditions are met:
   1. The LLM believes the task is complete. Instead of an action, the LLM can return an indication that it believes the user's task is complete based on the state of the DOM and the action history up to this point.
   2. The user stopped the task's execution. The user can stop the LLM's execution at any time, without waiting for it to complete.
   3. There was an error. Taxy's safety-first architecture causes it to automatically halt execution in the event of an unexpected response.
4. Taxy executes the action using the [chrome.debugger API](https://developer.chrome.com/docs/extensions/reference/debugger/).
5. The action is added to the action history and Taxy cycles back to step 1 and parses the updated DOM. All prior actions are sent to the LLM as part of the prompt used to determine the next action. Taxy can currently complete a maximum of 50 actions for a single task, though in practice most tasks require fewer than 10 actions.

## Simple Demos

### Protecting the main branch in GitHub

![main-branch](https://user-images.githubusercontent.com/41524992/228385404-175bf633-de1d-43eb-862c-2cfd5a7a674a.gif)

### Searching for and playing the movie Oblivion in Netflix

![Oblivion](https://user-images.githubusercontent.com/41524992/228063949-c26a4b54-92ae-4e22-8177-7e78c0d9a29b.gif)

### Creating a calendar event

![Calendar](https://user-images.githubusercontent.com/41524992/228064011-0ca3a39d-cebb-4a55-9e2b-6aa3ae5b3f43.gif)

### Writing an essay in the OpenAI playground

![Playground](https://user-images.githubusercontent.com/41524992/228064056-84eab4e4-b5b5-4e79-b1e3-be92f14d2607.gif)

### Add your own!

If you have an interesting demo you'd like to share, submit a PR to add your own!

## Tech Stack

Technology currently used by this extension:

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/)
- [React 17](https://reactjs.org)
- [Webpack 5](https://webpack.js.org/)
- [Webpack Dev Server 4](https://webpack.js.org/configuration/dev-server/)
- [React Hot Loader](https://github.com/gaearon/react-hot-loader)
- [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)

## Resources

- [Getting Started with Chrome Extensions](https://developer.chrome.com/extensions/getstarted)
