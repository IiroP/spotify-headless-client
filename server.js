const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const player = require('./puppeteer.js');

const port = 5000;
global.access_token = "";

const app = express();

// Init client id and secret
dotenv.config();
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

// Authentication (from https://developer.spotify.com/documentation/web-playback-sdk/howtos/web-app-player)
app.get('/auth/login', (req, res) => {
	const scope = 'streaming user-read-private user-read-email';
	const state = Math.random().toString();
	console.log(`Redirect URL is http://${req.get('host')}/auth/callback`);

	const auth_query_parameters = new URLSearchParams({
		response_type: "code",
		client_id: spotify_client_id,
		scope: scope,
		redirect_uri: `http://${req.get('host')}/auth/callback`,
		state: state
	})

	res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

// Authentication callback
app.get('/auth/callback', async (req, res) => {
	const code = req.query.code;
	console.log(`Callback URL is http://${req.get('host')}/auth/callback`);

	const authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		method: 'post',
		data: new URLSearchParams({
			code: code,
			redirect_uri: `http://${req.get('host')}/auth/callback`,
			grant_type: 'authorization_code'
		}),
		headers: {
			'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	try {
		const response = await axios(authOptions);
		access_token = response.data.access_token;
		res.redirect('/');
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

// Front page
app.get('/', (req, res) => {
	if (access_token == "") {
		res.redirect('/auth/login');
	} else {
		player.connect(access_token);
		res.send(`Successfully authenticated, you can close this page`);
	}
});

// Player page, used by Puppeteer
app.get('/play', (req, res) => res.sendFile(__dirname + '/player.html'));

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`)
})


