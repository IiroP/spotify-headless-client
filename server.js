const dotenv = require('dotenv');
const express = require('express');
const player = require('./puppeteer.js');
const auth = require('./auth.js');

const port = 5000;

const app = express();

// Authentication 
app.get('/auth/login', auth.login)

// Authentication callback
app.get('/auth/callback', async (req, res) => {
	try {
		await auth.loginCallback(req, res);
		res.redirect('/');
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

// Front page
app.get('/', (req, res) => {
	if (auth.token() == "") {
		res.redirect('/auth/login');
	} else {
		player.connect(auth.token);
		res.send(`Successfully authenticated, you can close this page`);
	}
});

// Player page, used by Puppeteer
app.get('/play', (req, res) => res.sendFile(__dirname + '/player.html'));

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`)
})


