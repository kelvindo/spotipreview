import React, { useEffect, useState } from 'react';
import './Playlist.css';
import Tracklist from './Tracklist';
 
function Playlist({ playlistID }) {

  const [playlistNameOwner, setPlaylistNameOwner] = useState('')
  const [songSamples, setSongSamples] = useState([]);

  //spotify:playlist:37i9dQZF1DWSTc9FdySHtz
  //spotify:playlist:5vwNi0Km340HsC5UfwaaIa
  //spotify:playlist:6pCv62MghRNCEFaUSi7OSD

  const fetchSongSamples = () => {
    const params = new URLSearchParams({playlist_id: playlistID});
    fetch("/playlist?" + params)
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setPlaylistNameOwner(json.playlist_name + " by " + json.playlist_owner);
        setSongSamples(json.song_datas);
      }).catch(e => {
        console.log(e);
      })
  };

  useEffect(() => {
    if (playlistID) {
      fetchSongSamples();
    }
  }, [playlistID]);

  return (
    <div className="playlistMain">
      <p>{ playlistNameOwner }</p>
      <Tracklist
        songSamples={songSamples}
        spotifyID={playlistID}
      />
    </div>
  );
}
 
export default Playlist;