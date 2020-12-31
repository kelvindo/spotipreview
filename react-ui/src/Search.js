import React, { useState } from 'react';
import './Playlist.css';
import Playlist from "./Playlist";
import SearchResults from './SearchResults';
 
// Search is a component that can search for an artist/playlist,
// display search results, and display a song preview player.
function Search() {
  // query is the search input string.
  const [query, setQuery] = useState('');

  // artistResults are the artists search results returned from the query.
  const [artistResults, setArtistResults] = useState([]);

  // playlistResults are the playlist search results returned from the query.
  const [playlistResults, setPlaylistResults] = useState([]);

  // spotifyID is the ID of the entity clicked (artistID or playlistID).
  const [spotifyID, setSpotifyID] = useState('');
  
  // type is the type of entity clicked ("artist" or "playlist").
  const [type, setType] = useState('');

  // search send a search request to the API. Populate the search results
  // and clear out the spotifyID and type to stop the song player.
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

  // clickSearchResult is a helper to set the spotifyID and type. This
  // is passed the SearchResults componenet as a callback.
  const clickSearchResult = (spotifyID, type) => {
    setSpotifyID(spotifyID);
    setType(type);
  };

  // Consists of:
  // - Search query input.
  // - Search button.
  // - Search results (hide if result clicked).
  // - Playlist + Player.
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