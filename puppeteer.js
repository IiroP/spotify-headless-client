const puppeteer = require('puppeteer');

let browser = null;
let page = null;
let access_token = null;

const start = async () => {
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
	page = await browser.newPage();
}

const connect = async (token) => {
	// Start system first
	if (page == null || page == undefined) {
		await start();
	}
	// Do not connect if already connected
	if (token == access_token) {
		return;
	}

	access_token = token;
	await page.goto('http://localhost:5000/play');
	await page.waitForSelector('.ready');
	console.log('Ready');
	
	await page.evaluate((access_token) => {
		window.player = new window.Spotify.Player({
			name: 'Web Playback SDK',
			getOAuthToken: cb => { cb(access_token); },
			volume: 0.5
		});
	}, access_token);
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

// Stop the instance
const stop = async () => {
	await browser.close();
}

exports.connect = connect;
exports.stop = stop;