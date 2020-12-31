import React from 'react';
import logo from './spotify.svg';
import './App.css';
import Search from './Search';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <Search/>
        </div>
      </header>
    </div>
  );
}

export default App;
