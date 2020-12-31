import React, { useState } from 'react';
import './Playlist.css';
import Playlist from "./Playlist";
import SearchResults from './SearchResults';
 
function Search() {

  const [query, setQuery] = useState('tritonal');
  const [artistResults, setArtistResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [spotifyID, setSpotifyID] = useState('');
  const [type, setType] = useState('');

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
        setSpotifyID("");
        setType("");
      }).catch(e => {
        console.log(e);
      })
  };

  const clickSearchResult = (spotifyID, type) => {
    setSpotifyID(spotifyID);
    setType(type);
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
      { (artistResults.length > 0 || playlistResults.length > 0) &&
        !spotifyID &&
        <SearchResults
          artistResults={artistResults}
          playlistResults={playlistResults}
          onClick={clickSearchResult}
        />
      }
      <Playlist 
        spotifyID={spotifyID}
        type={type}
      />
    </div>
  );
}
 
export default Search;