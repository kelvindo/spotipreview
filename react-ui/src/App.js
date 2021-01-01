import React, { useEffect, useState } from 'react';
import logo from './spotify.svg';
import './App.css';
import Search from './Search';

function App() {
  const [authorizeURL, setAuthorizeURL] = useState('');

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

  useEffect(() => {
    getAuthorizeURL();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      {/* <a href={authorizeURL}><button className="myButton">Login</button></a> */}
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <Search/>
        </div>
      </header>
    </div>
  );
}

export default App;
