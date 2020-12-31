import React from 'react';
import './Playlist.css';
 
function SearchResults({ artistResults, playlistResults, onClick }) {
  return (
    <div className="searchResultsMain">
      <h3>Artists</h3>
      <table className="center">
        <tbody>
            {artistResults.map(artist => (
              <tr key={artist.key}>
                <td>
                  <p className="searchResult" onClick={() => onClick(artist.spotify_id, artist.type)}>{artist.name}</p>
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
                  <p className="searchResult" onClick={() => onClick(playlist.spotify_id, playlist.type)}>{playlist.name}</p>
                </td>
              </tr> 
            ))}
        </tbody>
      </table>
    </div>
  );
}
 
export default SearchResults;