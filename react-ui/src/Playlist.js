import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Playlist.css';
 
function Playlist() {

  const audioRef = useRef();
  const [query, setQuery] = useState('37i9dQZF1DWSTc9FdySHtz');
  const [playlistNameOwner, setPlaylistNameOwner] = useState('')
  const [songSamples, setSongSamples] = useState(['', '']);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [currentSongArtist, setCurrentSongArtist] = useState('');
  const [currentSongSample, setCurrentSongSample] = useState('');

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
        setCurrentIndex(0);
      }).catch(e => {
        console.log(e);
      })
  };

  const nextSong = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % songSamples.length)
  });

  const handleUserKeyPress = useCallback(event => {
    const { key } = event;

    if (key === "ArrowRight") {
      setCurrentIndex(prevIndex => (prevIndex + 1))
    }

    if (key === "ArrowLeft") {
      setCurrentIndex(prevIndex => (prevIndex - 1))
    }
  }, []);

  useEffect(() => {
    const song = songSamples[currentIndex].name;
    const artist = songSamples[currentIndex].artist;
    const songArtist = song ? song + " by " + artist : "";
    setCurrentSongArtist(songArtist);
    setCurrentSongSample(songSamples[currentIndex].sample);
    audioRef.current.load();
  }, [currentIndex, playlistNameOwner]);

   // Add event listeners
   useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

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
      <button className="myButton" onClick={nextSong}>Next Song</button>
      <p>{ playlistNameOwner }</p>
      <p>{currentIndex + 1}/{songSamples.length} {currentSongArtist}</p>
      <audio controls autoPlay ref={audioRef}>
        <source src={currentSongSample} type="audio/mp3"/>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
 
export default Playlist;