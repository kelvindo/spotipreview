const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
  redirectUri: isDev ? "http://localhost:5000/callback" : "http://spotipreview.herokuapp.com/callback",
});

const callbackRedirect = isDev ? "http://localhost:3000/" : "http://spotipreview.herokuapp.com/";
var defaultSpotifyAccessToken = "";

spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
 
    // Save the access token so that it's used in future calls
    defaultSpotifyAccessToken = data.body.access_token;
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);

// extractSongData is a helper to extract needed information about a track.
const extractSongData = (track) => {
  const artists = track.artists.map(artist => { return artist.name });
  const artists_joined = artists.join(", ");
  const artist_ids = track.artists.map(artist => { 
    return {
      "name": artist.name,
      "spotify_id": artist.id,
    }
  });
  return {
    "id": track.id,
    "name": track.name,
    "sample": track.preview_url,
    "artist": artists_joined,
    "artists": artist_ids,
  }
};

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

  // Body parser.
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Use the session middleware
  app.use(session({ 
    secret: "secret",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    resave: false,
    saveUninitialized: false,
  }));

  // Spotify access token middleware.
  app.use(function (req, res, next) {
    if (req.session.spotifyAccount) {
      // Refresh the access token.
      const { refresh_token } = req.session.spotifyAccount;
      spotifyApi.setRefreshToken(refresh_token);
      spotifyApi.refreshAccessToken()
      .then((data) => {
        spotifyApi.setAccessToken(data.body.access_token);
      })
      .catch(function(err) {
        console.log('Something went wrong!', err);
      });
    } else {
      spotifyApi.setAccessToken(defaultSpotifyAccessToken);
    }
    // spotifyApi.setAccessToken(defaultSpotifyAccessToken);
    next();
  })

  app.get('/login', (req,res) => {
    var scopes = ['user-library-modify']
    var authUrl = spotifyApi.createAuthorizeURL(scopes)
    res.json({
      "authorize_url": authUrl+"&show_dialog=true",
    });
  })

  app.get('/callback', async (req, res) => {
    const { code } = req.query
    spotifyApi.authorizationCodeGrant(code)
    .then((data) => {
      const { access_token, refresh_token } = data.body
      spotifyApi.setAccessToken(access_token)
      spotifyApi.setRefreshToken(refresh_token)
  
      req.session.spotifyAccount = { refresh_token }
      console.log("callback done", access_token, refresh_token);
  
      res.redirect(callbackRedirect);
    })
    .catch(function(err) {
      console.log('Something went wrong!', err);
    });
  });

  app.get('/is_logged_in', (req,res) => {
    var isLoggedIn = false;
    if (req.session.spotifyAccount) {
      isLoggedIn = true;
    }
    res.json({
      "is_logged_in": isLoggedIn,
    });
  })

  // Search for playlists.
  app.get('/search', function (req, res) {
    console.log("spotify access", spotifyApi.getAccessToken());
    const searchPromise = spotifyApi.search(req.query.search_query, ["artist", "playlist"], { limit: 5 })
    Promise.all([searchPromise])
    .then(([ searchResults ]) => {
      // Process artist results.
      const artistResults = [];
      for (const [index, artist] of searchResults.body.artists.items.entries()) {
        artistResults.push({
          "key": index,
          "name": artist.name,
          "spotify_id": artist.id,
          "type": "artist",
        })
      }

      // Process playlist results.
      const playlistResults = [];
      for (const [index, playlist] of searchResults.body.playlists.items.entries()) {
        playlistResults.push({
          "key": index,
          "name": playlist.name,
          "spotify_id": playlist.id, 
          "type": "playlist",
        })
      }

      // Return combined jsonified results.
      res.json({
        "artists": artistResults,
        "playlists": playlistResults,
      });
    })
    .catch(function(err) {
      console.log('Something went wrong!', err);
    });
  });

  // Fetch artists top tracks and recommended tracks.
  app.get('/artist', function (req, res) {
    const artistInfoPromise = spotifyApi.getArtist(req.query.artist_id);
    const artistTopTracksPromise = spotifyApi.getArtistTopTracks(req.query.artist_id, "US");
    const artistTrackRecsPromise = spotifyApi.getRecommendations({ seed_artists: [req.query.artist_id], limit: 25 })
    Promise.all([artistInfoPromise, artistTopTracksPromise, artistTrackRecsPromise])
    .then(([ artistInfo, artistTopTracks, artistTrackRecs ]) => {
      const songDatas = [];
      
      // Append the artists top tracks.
      for (var track of artistTopTracks.body.tracks) {
        if (track.preview_url) {
          songDatas.push(extractSongData(track));
        }
      }

      // Append recommended tracks based on this artist.
      for (var track of artistTrackRecs.body.tracks) {
        if (track.preview_url) {
          songDatas.push(extractSongData(track));
        }
      }

      res.json({
        "artist_name": artistInfo.body.name,
        "song_datas": songDatas,
      });
    })
    .catch(function(err) {
      console.log('Something went wrong!', err);
    });
  });

   // Fetch playlist songs.
  app.get('/playlist', function (req, res) {
    const playlistInfoPromise = spotifyApi.getPlaylist(req.query.playlist_id);
    const playlistSongsPromise = spotifyApi.getPlaylistTracks(req.query.playlist_id);

    Promise.all([playlistInfoPromise, playlistSongsPromise])
    .then(([ playlistInfo, playlistSongs ]) => {
      const songDatas = [];
      for (var item of playlistSongs.body.items) {
        if (item.track && item.track.preview_url) {
          songDatas.push(extractSongData(item.track));
        }
      }
      res.json({
        "playlist_name": playlistInfo.body.name,
        "playlist_description": playlistInfo.body.description,
        "playlist_owner": playlistInfo.body.owner.display_name,
        "song_datas": songDatas,
      });
    })
    .catch(function(err) {
      console.log('Something went wrong!', err);
    });
  });

  // Save song to authenticated user's music library.
  app.post('/save_song', function (req, res) {
    spotifyApi.addToMySavedTracks([req.body.song_id])
    .then(() => {
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.log('Something went wrong!', err);
    });
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

  app.listen(PORT, function () {
    console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
  });
}
