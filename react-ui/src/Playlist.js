import React, { useEffect, useState } from 'react';
import './Playlist.css';
import TracklistPlayer from './TracklistPlayer';
 
// Playlist is a compoenent that takes a spotifyID and type to
// fetch either artist or playlist info and tracks. 
function Playlist({ spotifyID, type }) {
  // displayText shows either artist name or playlist + owner.
  const [displayText, setDisplayText] = useState('')

  // songSamples is the list of song data to pass to the Tracklist.
  const [songSamples, setSongSamples] = useState([]);

  // fetchPlaylistTracks fetches playlist info and tracks and sets state.
  const fetchPlaylistTracks = () => {
    const params = new URLSearchParams({playlist_id: spotifyID});
    fetch("/playlist?" + params)
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setDisplayText(json.playlist_name + " by " + json.playlist_owner);
        setSongSamples(json.song_datas);
      }).catch(e => {
        console.log(e);
      })
  };

  // fetchArtistTracks fetches artist info and tracks and sets state.
  const fetchArtistTracks = () => {
    const params = new URLSearchParams({artist_id: spotifyID});
    fetch("/artist?" + params)
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setDisplayText(json.artist_name + " top tracks and recommendations");
        setSongSamples(json.song_datas);
      }).catch(e => {
        console.log(e);
      })
  };

  // clearSongSamples is a helper to clear out display text
  // and song samples if a spotifyID is no longer passed in.
  const clearSongSamples = () => {
    setDisplayText("");
    setSongSamples([]);
  };

  // This effect updates on changes to the spotifyID. If the spotifyID
  // is set, fetch data accordingly. If it's unset, clear out data.
  useEffect(() => {
    if (spotifyID) {
      if (type === "artist") {
        fetchArtistTracks();
      } else if (type === "playlist") {
        fetchPlaylistTracks();
      } else {
        console.error("Unknown type");
      }
      
    } else {
      clearSongSamples();
    }
  }, [spotifyID]);

  // Consists of:
  // - Display text (artist or playlist + owner).
  // - TracklistPlayer with songSamples.
  return (
    <div className="playlistMain">
      <h3>{ displayText }</h3>
      <TracklistPlayer
        songSamples={songSamples}
      />
    </div>
  );
}
 
export default Playlist;