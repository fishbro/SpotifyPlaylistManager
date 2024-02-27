# Spotify Playlist Management Application

This application allows users to manage their Spotify playlists. Users can log in with their Spotify account, create a playlist, and add all albums from their library to the playlist.

## Setup
1. Create a Spotify Developer account and register your application to obtain the client ID and client secret.
2. Set the redirect URI in your Spotify Developer dashboard to `http://localhost:3000/callback`.

## Installation
1. Clone the repository.
2. Install dependencies with `npm install`.
3. Create a `credentials.js` file in the project root and export your client ID and client secret:

```javascript
// credentials.js
module.exports = {
    clientId: 'your_client_id_here',
    clientSecret: 'your_client_secret_here'
};
```

## Usage
1. Start the server with `npm start`.
2. Navigate to `http://localhost:3000` in your browser.
3. Click "Log in with Spotify" to authorize the application.
4. Once authorized, you can create a playlist and add albums to it.

## Authorization
This application requires the following Spotify scopes for full functionality:

- `user-read-private`
- `user-read-email`
- `playlist-modify-private`
- `user-follow-read`
- `user-library-read`
- `playlist-modify-public`
- `playlist-modify-private`

For more information on Spotify authorization, see [Spotify Web API Authorization Guide](https://developer.spotify.com/documentation/web-api/authorization).

**Note:** This application is for educational purposes only and should not be used for production purposes.
