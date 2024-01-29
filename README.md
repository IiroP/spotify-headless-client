# Headless Spotify client

This project is an unofficial client for Spotify Connect. It uses Spotify Web
Playback API running on a headless browser instance. Spotify requires Premium
subscription to use the API.

## Setting up API access

- Register a new application to
  [Spotify Developer](https://developer.spotify.com/)
  - Redirect url is `http://[device ip]:5000/auth/callback`
  - Web API and Web Playback API
- Create `.env` file to root of project:
  ```
  SPOTIFY_CLIENT_ID='your client id'
    SPOTIFY_CLIENT_SECRET='your client secret'
  ```

## Installation

- In ideal cases: `npm install`
- To install Firefox, run `npx puppeteer browsers install firefox`
- Set up API access as instructed
- Change default config values if necessary

## Usage

- Run `npm start`
- Using any device, go to `http://[server ip]:5000` for authentication
- After successful authentication, the device should show up in Spotify as
  target

## Configuration

- Defaults are in file `config/default.json`, you can override them directly or
  in `config/local.json`
  - `deviceName` is how the device appears on Spotify
  - `browser` is one of the predefined browser configurations
    - `chrome` is default
    - `firefox` uses Firefox (see known issues)
    - `raspberry` is for Raspberry Pi (requires `firefox` to be installed)
    - `raspberry_chromium` is legacy config for Raspberry Pi (requires
      `chromium_browser`)

## API Control

- The application has some API endpoints for controlling the player via
  `HTTP POST` requests
  - `/api/play-pause` for toggling between play and pause
  - `/api/next` for skipping to next track
  - `/api/prev` for returning to previous track

## Known issues

- Audio lags/stutters relatively often when using Chromium on Raspberry Pi
- Older versions of Firefox may not work

## Inspired by

- [Spotify Web Playback API sample](https://developer.spotify.com/documentation/web-playback-sdk/howtos/web-app-player)
- [spotify-playback-sdk-node](https://github.com/SamuelScheit/spotify-playback-sdk-node)
  by Samuel Scheit

## Disclaimer

This project, including the code snippets provided, is not affiliated with or
supported by Spotify. The project does not encourage or endorse any use that may
violate Spotify's Terms of Service. Users are responsible for ensuring their
usage of Spotify's APIs and services complies with the applicable terms and
conditions set by Spotify.
