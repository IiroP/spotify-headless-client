import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from "puppeteer";
import config from "config";

declare global {
  interface Window {
    player: Spotify.Player;
    getToken: () => Promise<string>;
  }
}

let browser: Browser | null = null;
let page: Page | null = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let access_token = null;

// Read config
const deviceName = config.get("deviceName");
const restartOnError = config.get("restartOnError");

const firefox: PuppeteerLaunchOptions = {
  headless: true,
  extraPrefsFirefox: {
    "media.gmp-manager.updateEnabled": true,
    "media.eme.enabled": true,
    "media.autoplay.default": 0,
  },
  protocol: "webDriverBiDi",
  browser: "firefox",
};

const chrome: PuppeteerLaunchOptions = {
  headless: true,
  ignoreDefaultArgs: ["--mute-audio", "--disable-component-update"],
  channel: "chrome",
};

const raspberry: PuppeteerLaunchOptions = {
  headless: true,
  dumpio: true,
  extraPrefsFirefox: {
    "media.gmp-manager.updateEnabled": true,
    "media.eme.enabled": true,
    "media.autoplay.default": 0,
  },
  protocol: "webDriverBiDi",
  browser: "firefox",
  executablePath: "/usr/bin/firefox",
};

const raspberry_chromium: PuppeteerLaunchOptions = {
  headless: true,
  dumpio: true,
  ignoreDefaultArgs: ["--mute-audio"],
  args: ["--disable-gpu"],
  executablePath: "/usr/bin/chromium-browser",
};

const start = async () => {
  const selected = config.get("browser");
  let browserConf: PuppeteerLaunchOptions = chrome;
  switch (selected) {
    case "firefox":
      browserConf = firefox;
      break;
    case "raspberry":
      browserConf = raspberry;
      break;
    case "raspberry_chromium":
      browserConf = raspberry_chromium;
      break;
  }
  browser = await puppeteer.launch(browserConf);
  page = await browser.newPage();
  page.on("console", (log) =>
    console.log(`[Browser] ${log.type()}: ${log.text()}`)
  ); // normal console
  page.on("pageerror", (err) => {
    // page error
    console.log(`[Browser] ${err.message}`);
    if (restartOnError) {
      console.log("Page error detected, restarting...");
      reset();
    }
  });
  if (browserConf.browser != "firefox") {
    page.on("requestfailed", (req) =>
      console.log(`[Browser] ${req.failure()?.errorText}, ${req.url()}`)
    ); // failed request
  }
  // About logging errors, see this: https://github.com/puppeteer/puppeteer/issues/1512
};

const connect = async (getToken: () => string) => {
  // Start system first but only once
  if (page === null || page === undefined) {
    await start();
  } else {
    return;
  }

  access_token = getToken();
  await page!.goto("http://localhost:5000/play");
  await page!.waitForSelector(".ready");
  console.log("Ready");

  // Do not use static token
  await page!.exposeFunction("getToken", getToken);

  await page!.evaluate(async (deviceName) => {
    window.player = new window.Spotify.Player({
      name: deviceName as string,
      getOAuthToken: (cb) => {
        window.getToken().then((access_token) => {
          cb(access_token);
        });
      },
      volume: 0.5,
    });
  }, deviceName);

  console.log("Created player");
  await page!.evaluate(async () => {
    window.player.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
    });

    window.player.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });

    window.player.addListener("initialization_error", ({ message }) => {
      console.error(message);
    });

    window.player.addListener("authentication_error", ({ message }) => {
      console.error(message);
    });

    window.player.addListener("account_error", ({ message }) => {
      console.error(message);
    });

    window.player.addListener("playback_error", ({ message }) => {
      console.error(message);
    });

    /*window.player.addListener('autoplay_failed', ({ message }) => {
			console.error(message);
		});*/

    window.player.connect().then((success) => {
      if (success) {
        console.log("The Web Playback SDK successfully connected to Spotify!");
      } else {
        console.error("The Web Playback SDK could not connect to Spotify.");
      }
    });
  });
};

// Toggle play/pause
const playPause = async () => {
  return await page?.evaluate(async () => await window.player.togglePlay());
};

// Previous track
const prevTrack = async () => {
  await page?.evaluate(async () => await window.player.previousTrack());
};

// Next track
const nextTrack = async () => {
  await page?.evaluate(async () => await window.player.nextTrack());
};

// Stop the instance
const stop = async () => {
  if (browser !== null) {
    await browser.close();
  }
};

const reset = async () => {
  return await page?.evaluate(async () => {
    await window.player.disconnect();
    window.player.connect().then((success) => {
      if (success) {
        console.log("The Web Playback SDK successfully connected to Spotify!");
      } else {
        console.error("The Web Playback SDK could not connect to Spotify.");
      }
    });
  });
};

// Get status info
const status = async () => {
  return await page!.evaluate(
    async () => await window.player.getCurrentState()
  );
};

export { connect, stop, playPause, prevTrack, nextTrack, status, reset };
