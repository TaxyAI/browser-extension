<img src="src/assets/img/icon-128.png" width="64"/>

# Web Agent Browser Extension

## Features

Web Agent is a Chrome Extension that sends a simplified version of the browser's DOM to GPT-4 along with a user-specified task to accomplish, then utilizes Chrome's built-in extension APIs to interact with the browser to perform the actions GPT-4 suggests.

## Tech Stack

Current technology used by this extension:

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/)
- [React 17](https://reactjs.org)
- [Webpack 5](https://webpack.js.org/)
- [Webpack Dev Server 4](https://webpack.js.org/configuration/dev-server/)
- [React Hot Loader](https://github.com/gaearon/react-hot-loader)
- [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)

## Installing and Running

Currently this extension is only available through the GitHub repo. We plan to release on the Chrome Web Store after fixing some known bugs and adding features to increase its appeal to a non-technical audience. To build and install the extension locally on your machine, follow the instructions below.

### Installing the extension

1. Check if your [Node.js](https://nodejs.org/) version is >= **16**.
2. Clone this repository.
3. Run `yarn` to install the dependencies.
4. Run `yarn start` to build the package
5. Load your extension on Chrome by doing the following:
   1. Navigate to `chrome://extensions/`
   2. Toggle `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder that `yarn start` generated.

### Running in your browser

1. Once installed, the browser plugin will be available in two forms:
   1. As a Popup. Activate by pressing `cmd+shift+y` on mac or `ctrl+shift+y` on windows/linux, or by clicking the extension logo in your browser.
   2. As a devtools panel Activate by first opening the browser's developer tools, then navigating to the `Web Agent` panel.
2. The next thing you need to do is create or access an existing [OpenAI API Key](https://platform.openai.com/account/api-keys) and paste it in the provided prompt. This key will be stored securely in your browser, not uploaded to any external server.
3. Finally, navigate to a webpage you want Web Agent to act upon (for instance the [OpenAI playground](https://platform.openai.com/playground)) and start experimenting!

## Simple Demos

### Writing an essay in the OpenAI playground
![playground](https://user-images.githubusercontent.com/41524992/227739246-53cb4587-6fa1-491f-80fa-f05ec0b13967.gif)


### Creating a calendar event
![Calendar](https://user-images.githubusercontent.com/41524992/227739258-e4721e54-1f97-46e2-a50e-36580ef26bc7.gif)


### Searching for and playing the movie Oblivion in Netflix



### Add your own!

If you have an interesting demo you'd like to share, submit a PR to add your own!

## Resources:

- [Chrome Extension documentation](https://developer.chrome.com/extensions/getstarted)
