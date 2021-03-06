import React, { useCallback, useEffect, useRef, useState } from 'react';
import './style.css';
 
// TracklistPlayer is a stateless componenet that takes in a list of songSamples
// and creates a music player with track controls.
function TracklistPlayer({ songSamples, onClick }) {
  // audioRef is a reference to the audio element.
  const audioRef = useRef();

  // currentIndex is the current index within the list of songSamples we are at.
  const [currentIndex, setCurrentIndex] = useState(0);

  // currentSongArtist is the display text for the current song.
  const [currentSongArtist, setCurrentSongArtist] = useState('');

  // currentSongSample is the preview URL of the current song.
  const [currentSongSample, setCurrentSongSample] = useState('');

  // saveButtonEnabled is determines whether the save button is clickable.
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);

  // isLoggedIn determines if the user is authenticated.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // authorizeURL is used to create a link to log in the user.
  const [authorizeURL, setAuthorizeURL] = useState('');

  // prevSong navigates to the previous song unless it's the first.
  const prevSong = useCallback(() => {
    setCurrentIndex(prevIndex => {
      if (prevIndex === 0) {
        return prevIndex;
      }
      return prevIndex - 1;
    });
  });

  // nextSong navigates to the next song.
  const nextSong = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % songSamples.length)
  });

  // saveSong sends a POST request to save a song to the user's library.
  const saveSong = (songID) => {
    fetch("/save_song", {
      method: 'POST',
      body: JSON.stringify({
        "song_id": songID,
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        setSaveButtonEnabled(false);
      }).catch(e => {
        console.log(e);
      })
  };

  const fetchIsLoggedIn = () => {
    fetch("/is_logged_in")
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setIsLoggedIn(json.is_logged_in);
      }).catch(e => {
        console.log(e);
      })
  }

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

  // getAuthorizeURL queries the server for the authorize URL and sets it.
  const getAuthorizeURL = () => {
    fetch("/login")
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setAuthorizeURL(json.authorize_url);
      }).catch(e => {
        console.log(e);
      })
  };

  // This effect updates the track player on changes to the currentIndex or
  // song samples. It updates displayed song data and current preview URL.
  useEffect(() => {
    if (songSamples.length > 0) {
      const song = songSamples[currentIndex].name;
      const songArtist = song ? song: "";
      setCurrentSongArtist(songArtist);
      setCurrentSongSample(songSamples[currentIndex].sample);
      setSaveButtonEnabled(true);
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
    fetchIsLoggedIn();
  }, [songSamples]);

   // This effect adds the keyboard event listeners once at the beginning.
   useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []);

  // Fetch the authorize URL.
  useEffect(() => {
    getAuthorizeURL();
  }, []);

  // Consists of:
  // - Current Song
  // - Song artists (clickable)
  // - Track player control buttons.
  // - Save button.
  // - Audio player
  return (
    <div className="tracklistPlayerMain">
      { songSamples.length > 0 &&
        <div>
          <p>{currentSongArtist}</p>
          {songSamples[currentIndex].artists.map((artist, index) => {
            return <span className="clickable" onClick={() => onClick(artist.spotify_id, "artist")} key={index}>{artist.name} </span>
          })}
          <div className="trackControls">
          <button className="myButton" onClick={prevSong}>Prev</button>
          <button className="myButton" onClick={nextSong}>Next</button>
          { isLoggedIn &&
            <button 
              className={ saveButtonEnabled ? "myButton" : "myButton saved"} 
              disabled={!saveButtonEnabled} 
              onClick={() => saveSong(songSamples[currentIndex].id)}>
                Save
            </button>
          }  
          { !isLoggedIn &&
            <a href={authorizeURL}><button className="myButton">Save Song to Spotify</button></a>
          }
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
 
export default TracklistPlayer;