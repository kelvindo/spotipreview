import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Playlist.css';
 
// Tracklist is a stateless componenet that takes in a list of songSamples
// and creates a music player with track controls.
function Tracklist({ songSamples }) {
  // audioRef is a reference to the audio element.
  const audioRef = useRef();

  // currentIndex is the current index within the list of songSamples we are at.
  const [currentIndex, setCurrentIndex] = useState(0);

  // currentSongArtist is the display text for the current song.
  const [currentSongArtist, setCurrentSongArtist] = useState('');

  // currentSongSample is the preview URL of the current song.
  const [currentSongSample, setCurrentSongSample] = useState('');

  // prevSong navigates to the previous song.
  const prevSong = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1) % songSamples.length)
  });

  // nextSong navigates to the next song.
  const nextSong = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % songSamples.length)
  });

  // handleUserKeyPress is a callback to allow using the keyboard arrow keys
  // to navigate tracks.
  const handleUserKeyPress = useCallback(event => {
    const { key } = event;

    if (key === "ArrowRight") {
      setCurrentIndex(prevIndex => (prevIndex + 1))
    }

    if (key === "ArrowLeft") {
      setCurrentIndex(prevIndex => (prevIndex - 1))
    }
  }, []);

  // This effect updates the track player on changes to the currentIndex or
  // song samples. It updates displayed song data and current preview URL.
  useEffect(() => {
    if (songSamples.length > 0) {
      const song = songSamples[currentIndex].name;
      const artist = songSamples[currentIndex].artist;
      const songArtist = song ? song + " by " + artist : "";
      setCurrentSongArtist(songArtist);
      setCurrentSongSample(songSamples[currentIndex].sample);
      audioRef.current.load();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [currentIndex, songSamples]);

  // This effect resets the current index and pauses the song player when the song
  // samples change.
  useEffect(() => {
    setCurrentIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [songSamples]);

   // This effect adds the keyboard event listeners once at the beginning.
   useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []);

  // Consists of:
  // - Display text for song + artist and a track counter.
  // - Track player control buttons.
  // - Audio player.
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