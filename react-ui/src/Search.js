import React, { useState } from 'react';
import './Playlist.css';
import Playlist from "./Playlist";
 
function Search() {

  const [query, setQuery] = useState('tritonal');
  const [artistResults, setArtistResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [artistID, setArtistID] = useState('');
  const [playlistID, setPlaylistID] = useState('');

  const search = () => {
    const params = new URLSearchParams({search_query: query});
    fetch("/search?" + params)
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setArtistResults(json.artists);
        setPlaylistResults(json.playlists);
      }).catch(e => {
        console.log(e);
      })
  };

  const clickResult = (spotifyID, type) => {
    console.log("Clicked", spotifyID, type);
    if (type === "artist") {
      setArtistID(spotifyID);
      setPlaylistID("");
    } else if (type === "playlist") {
      setArtistID("");
      setPlaylistID(spotifyID);
    } else {
      console.error("Unexpected type");
    }
  };

  return (
    <div className="searchMain">
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Search Spotify"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </div>
      <button className="myButton" onClick={search}>Search</button>
      <h3>Artists</h3>
      <table className="center">
        <tbody>
            {artistResults.map(artist => (
              <tr key={artist.key}>
                <td>
                  <p onClick={() => clickResult(artist.spotify_id, artist.type)}>{artist.name}</p>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <h3>Playlists</h3>
      <table className="center">
        <tbody>
            {playlistResults.map(playlist => (
              <tr key={playlist.key}>
                <td>
                  <p onClick={() => clickResult(playlist.spotify_id, playlist.type)}>{playlist.name}</p>
                </td>
              </tr> 
            ))}
        </tbody>
      </table>
      <Playlist 
        playlistID={playlistID}
      />
    </div>
  );
}
 
export default Search;