import React, { useState } from 'react';
import './Playlist.css';
import Artist from "./Artist";
import Playlist from "./Playlist";
import SearchResults from './SearchResults';
 
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
        setArtistID("");
        setPlaylistID("");
      }).catch(e => {
        console.log(e);
      })
  };

  const clickSearchResult = (spotifyID, type) => {
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
      { (artistResults.length > 0 || playlistResults.length > 0) &&
        !(artistID || playlistID) &&
        <SearchResults
          artistResults={artistResults}
          playlistResults={playlistResults}
          onClick={clickSearchResult}
        />
      }
      <Artist 
        artistID={artistID}
      />
      <Playlist 
        playlistID={playlistID}
      />
    </div>
  );
}
 
export default Search;