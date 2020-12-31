import React, { useState } from 'react';
import './Playlist.css';
import Tracklist from './Tracklist';
 
function Playlist() {

  const [query, setQuery] = useState('37i9dQZF1DWSTc9FdySHtz');
  const [playlistNameOwner, setPlaylistNameOwner] = useState('')
  const [songSamples, setSongSamples] = useState(['', '']);

  //spotify:playlist:37i9dQZF1DWSTc9FdySHtz
  //spotify:playlist:5vwNi0Km340HsC5UfwaaIa
  //spotify:playlist:6pCv62MghRNCEFaUSi7OSD

  const fetchSongSamples = () => {
    const params = new URLSearchParams({playlist_id: query});
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

  return (
    <div className="playlistMain">
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Playlist ID"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </div>
      <button className="myButton" onClick={fetchSongSamples}>Load Playlist</button>
      <p>{ playlistNameOwner }</p>
      <Tracklist
        songSamples={songSamples}
      />
    </div>
  );
}
 
export default Playlist;