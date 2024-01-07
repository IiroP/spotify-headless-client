# Headless Spotify client

This project is an unofficial client for Spotify Connect. It uses Spotify Web Playback API running on a headless browser instance. Spotify requires Premium subscription to use the API.

## Setting up API access
- Register a new application to [Spotify Developer](https://developer.spotify.com/)
  - Redirect url is `http://[device ip]:5000/auth/callback`
  - Web API and Web Playback API
- Create `.env` file to root of project:
  ```
	SPOTIFY_CLIENT_ID='your client id'
	SPOTIFY_CLIENT_SECRET='your client secret'
	```

## Platform-specific settings
*This part is subject to change as the current workflow is not very user-friendly*

### Puppeteer configuration for Desktop (x64):
  
```js
browser = await puppeteer.launch({
	headless: true,
	args: [
		'--use-fake-ui-for-media-stream',
	],
	extraPrefsFirefox: {
		'media.gmp-manager.updateEnabled': true,
		'media.eme.enabled': true,
		'media.autoplay.default': 0,
	},
	ignoreDefaultArgs: ['--mute-audio'],
	product: 'firefox',
});
```

### Puppeteer configuration for Raspberry Pi

```js
browser = await puppeteer.launch({
	headless: "new",
	args: ["--disable-gpu"],
	ignoreDefaultArgs: ['--mute-audio'],
	executablePath: '/usr/bin/chromium-browser',
});
```

## Installation

- In ideal cases: `npm install`
- To install Firefox, run `npx puppeteer browsers install firefox`
- Set up API access as instructed

## Usage

- Run `npm start`
- Using any device, go to `http://[server ip]:5000` for authentication
- After successful authentication, the device should show up in Spotify as target

## Known issues

- Audio lags/stutters relatively often
- Configuration is hardcoded
- Authentication is not saved and the lifetime of token is not tested

## Inspired by

- [Spotify Web Playback API sample](https://developer.spotify.com/documentation/web-playback-sdk/howtos/web-app-player)
- [spotify-playback-sdk-node](https://github.com/SamuelScheit/spotify-playback-sdk-node) by Samuel Scheit

## Disclaimer

This project, including the code snippets provided, is not affiliated with or supported by Spotify. The project does not encourage or endorse any use that may violate Spotify's Terms of Service. Users are responsible for ensuring their usage of Spotify's APIs and services complies with the applicable terms and conditions set by Spotify.
