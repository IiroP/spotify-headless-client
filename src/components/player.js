const puppeteer = require('puppeteer');
const config = require('config');

let browser = null;
let page = null;
let access_token = null;

// Read config
const deviceName = config.get("deviceName");

const firefox = {
	headless: true,
	extraPrefsFirefox: {
		'media.gmp-manager.updateEnabled': true,
		'media.eme.enabled': true,
		'media.autoplay.default': 0,
	},
	protocol: 'webDriverBiDi',
	product: 'firefox',
};

const chrome = {
	headless: "new",
	ignoreDefaultArgs: ['--mute-audio', '--disable-component-update'],
	channel: 'chrome',
};

const raspberry = {
	headless: "new",
	dumpio: true,
	ignoreDefaultArgs: ['--mute-audio'],
	args: ["--disable-gpu"],
	executablePath: '/usr/bin/chromium-browser',
};

const start = async () => {
	const selected = config.get("browser");
	let browserConf = chrome;
	switch (selected) {
		case "firefox":
			browserConf = firefox;
			break;
		case "raspberry":
			browserConf = raspberry;
			break;
	}
	browser = await puppeteer.launch(browserConf);
	page = await browser.newPage();
	page.on('console', (log) => console.log(`[Browser] ${log.type()}: ${log.text()}`)); // normal console
	page.on('pageerror', (err) => console.log(`[Browser] ${err.message}`)); // page error
	page.on('requestfailed', (req) => console.log(`[Browser] ${req.failure().errorText}, ${req.url()}`)); // failed request
	// About logging errors, see this: https://github.com/puppeteer/puppeteer/issues/1512
}

const connect = async (getToken) => {
	// Start system first but only once
	if (page == null || page == undefined) {
		await start();
	} else {
		return;
	}

	access_token = getToken();
	await page.goto('http://localhost:5000/play');
	await page.waitForSelector('.ready');
	console.log('Ready');

	// Do not use static token
	await page.exposeFunction("getToken", getToken);

	await page.evaluate(async (deviceName) => {
		window.player = new window.Spotify.Player({
			name: deviceName,
			getOAuthToken: cb => {
				window.getToken().then(access_token => {
					cb(access_token);
				});
			},
			volume: 0.5
		});
	}, deviceName);

	console.log('Created player');
	await page.evaluate(async () => {
		window.player.addListener('ready', ({ device_id }) => {
			console.log('Ready with Device ID', device_id);
		});

		window.player.addListener('not_ready', ({ device_id }) => {
			console.log('Device ID has gone offline', device_id);
		});

		window.player.addListener('initialization_error', ({ message }) => {
			console.error(message);
		});

		window.player.addListener('authentication_error', ({ message }) => {
			console.error(message);
		});

		window.player.addListener('account_error', ({ message }) => {
			console.error(message);
		});

		window.player.addListener('playback_error', ({ message }) => {
			console.error(message);
		});

		window.player.addListener('autoplay_failed', ({ message }) => {
			console.error(message);
		});

		window.player.connect().then(success => {
			if (success) {
				console.log('The Web Playback SDK successfully connected to Spotify!');
			} else {
				console.error('The Web Playback SDK could not connect to Spotify.');
			}
		});
	});
	console.log('Connected');
}

// Toggle play/pause
const playPause = async () => {
	return await page.evaluate(async () => await window.player.togglePlay());
}

// Previous track
const prevTrack = async () => {
	await page.evaluate(async () => await window.player.previousTrack());
}

// Next track
const nextTrack = async () => {
	await page.evaluate(async () => await window.player.nextTrack());
}

// Stop the instance
const stop = async () => {
	await browser.close();
}

exports.connect = connect;
exports.stop = stop;
exports.playPause = playPause;
exports.prevTrack = prevTrack;
exports.nextTrack = nextTrack;