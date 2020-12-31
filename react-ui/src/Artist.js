import React, { useEffect, useState } from 'react';
import './Playlist.css';
import Tracklist from './Tracklist';
 
function Artist({ artistID }) {

  const [artistName, setArtistName] = useState('')
  const [songSamples, setSongSamples] = useState([]);

  const fetchArtistSongs = () => {
    const params = new URLSearchParams({artist_id: artistID});
    fetch("/artist?" + params)
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setArtistName(json.artist_name);
        setSongSamples(json.song_datas);
      }).catch(e => {
        console.log(e);
      })
  };

  useEffect(() => {
    if (artistID) {
      fetchArtistSongs();
    }
  }, [artistID]);

  return (
    <div className="artistMain">
      <p>{ artistName }</p>
      <Tracklist
        songSamples={songSamples}
        spotifyID={artistID}
      />
    </div>
  );
}
 
export default Artist;