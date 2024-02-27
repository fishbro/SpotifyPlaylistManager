// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const express = require("express");
const request = require("request");
const credentials = require("./credentials");

const app = express();
const clientId = credentials.clientId;
const clientSecret = credentials.clientSecret;
const redirectUri = "http://localhost:3000/callback";
const scopes =
    "user-read-private user-read-email playlist-modify-private user-follow-read user-library-read playlist-modify-public playlist-modify-private";
let accessToken = "";
let playlistId = "";

app.get("/login", (req, res) => {
    res.redirect(
        `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}`
    );
});

app.get("/callback", (req, res) => {
    const code = req.query.code;
    const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        form: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code"
        },
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(clientId + ":" + clientSecret).toString("base64")
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        accessToken = body.access_token;
        // Use the access token to make API requests
        // Example: request.get('https://api.spotify.com/v1/me', { headers: { 'Authorization': 'Bearer ' + accessToken } }, callback);
        res.send('Login successful! Move to <a href="/controls">Controls</a>');
    });
});

app.get("/", (req, res) => {
    res.send('Hello<br><a href="/login">Log in with Spotify</a>');
});

app.get("/controls", (req, res) => {
    res.send('<a href="/create-playlist">Create Playlist</a>');
});

app.get("/create-playlist", (req, res) => {
    const options = {
        url: "https://api.spotify.com/v1/me/playlists",
        headers: { Authorization: "Bearer " + accessToken },
        json: true,
        body: {
            name: ".all",
            public: false
        }
    };

    request.post(options, (error, response, body) => {
        playlistId = body.id;
        res.send(
            'Playlist created! <a href="/add-all-albums-to-playlist">Add songs</a>'
        );
    });
});

const allAlbums = [];
app.get("/list-of-all-albums", (req, res) => {
    const loadAlbums = (url, delay = 150) => {
        const options = {
            url,
            headers: { Authorization: "Bearer " + accessToken },
            json: true
        };

        request.get(options, (error, response, body) => {
            if (error) {
                console.error("Error loading albums:", error);
                res.status(500).send("Error loading albums");
                return;
            }

            const albums = body.items;
            allAlbums.push(...albums);

            if (body.next) {
                setTimeout(() => {
                    loadAlbums(body.next, delay);
                }, delay);
            } else {
                res.send(allAlbums.map(album => album.album.name).join(", "));
            }
        });
    };

    const url = "https://api.spotify.com/v1/me/albums?limit=50";
    loadAlbums(url);
});

app.get("/add-all-albums-to-playlist", (req, res) => {
    const allAlbums = [];
    const allSongs = [];

    const addSongsToPlaylist = async songs => {
        const options = {
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            },
            json: true,
            body: { uris: songs }
        };

        try {
            await request.post(options);
            await new Promise(resolve => setTimeout(resolve, 150));
            console.log("Songs added to playlist successfully!");
        } catch (error) {
            console.error("Error adding songs to playlist:", error);
            throw new Error("Error adding songs to playlist");
        }
    };

    const addSongsInBatches = async () => {
        const batchSize = 100;
        for (let i = 0; i < allSongs.length; i += batchSize) {
            const batch = allSongs.slice(i, i + batchSize);
            await addSongsToPlaylist(batch.map(song => song.uri));
        }
        res.send("All songs added to playlist successfully!");
    };

    const loadSongsOfAllAlbums = async () => {
        for (let i = 0; i < allAlbums.length; i++) {
            const album = allAlbums[i];
            allSongs.push(...album.album.tracks.items);
        }
        addSongsInBatches().catch(err => console.error(err));
    };

    const loadAlbums = (url, delay = 150) => {
        const options = {
            url,
            headers: { Authorization: "Bearer " + accessToken },
            json: true
        };

        request.get(options, (error, response, body) => {
            if (error) {
                console.error("Error loading albums:", error);
                res.status(500).send("Error loading albums");
                return;
            }

            const albums = body.items;
            allAlbums.push(...albums);

            if (body.next) {
                setTimeout(() => {
                    loadAlbums(body.next, delay);
                }, delay);
            } else {
                loadSongsOfAllAlbums().catch(err => console.error(err));
            }
        });
    };

    const url = "https://api.spotify.com/v1/me/albums?limit=50";
    loadAlbums(url);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
