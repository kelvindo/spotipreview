import React, { useEffect, useState } from 'react';
import './Playlist.css';
import Tracklist from './Tracklist';
 
function Playlist({ spotifyID, type }) {

  const [displayText, setDisplayText] = useState('')
  const [songSamples, setSongSamples] = useState([]);

  //spotify:playlist:37i9dQZF1DWSTc9FdySHtz
  //spotify:playlist:5vwNi0Km340HsC5UfwaaIa
  //spotify:playlist:6pCv62MghRNCEFaUSi7OSD

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
        setDisplayText(json.artist_name);
        setSongSamples(json.song_datas);
      }).catch(e => {
        console.log(e);
      })
  };

  const clearSongSamples = () => {
    setDisplayText("");
    setSongSamples([]);
  };

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

  return (
    <div className="playlistMain">
      <p>{ displayText }</p>
      <Tracklist
        songSamples={songSamples}
      />
    </div>
  );
}
 
export default Playlist;