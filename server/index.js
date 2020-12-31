const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
 
    // Save the access token so that it's used in future calls
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
  return {
    "name": track.name,
    "sample": track.preview_url,
    "artist": artists_joined,
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

  // Search for playlists.
  app.get('/search', function (req, res) {
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

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

  app.listen(PORT, function () {
    console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
  });
}
