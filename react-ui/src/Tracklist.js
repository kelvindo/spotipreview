import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Playlist.css';
 
function Tracklist({ songSamples }) {
  const audioRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSongArtist, setCurrentSongArtist] = useState('');
  const [currentSongSample, setCurrentSongSample] = useState('');

  const prevSong = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1) % songSamples.length)
  });

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
    if (songSamples.length > 0) {
      const song = songSamples[currentIndex].name;
      const artist = songSamples[currentIndex].artist;
      const songArtist = song ? song + " by " + artist : "";
      setCurrentSongArtist(songArtist);
      setCurrentSongSample(songSamples[currentIndex].sample);
      audioRef.current.load();
    }
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [songSamples]);

   // Add event listeners
   useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return (
    <div className="tracklistMain">
      { songSamples.length > 0 &&
        <div className="tracklistInner">
        <p>{currentIndex + 1}/{songSamples.length} {currentSongArtist}</p>
        <div className="trackControls">
        <button className="myButton" onClick={prevSong}>Prev</button>
        <button className="myButton" onClick={nextSong}>Next</button>
        </div>
        <audio className="audioPlayer" controls autoPlay ref={audioRef}>
          <source src={currentSongSample} type="audio/mp3"/>
          Your browser does not support the audio element.
        </audio>
        </div>
      }
    </div>
  );
}
 
export default Tracklist;