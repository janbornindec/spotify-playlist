import styles from './App.module.css';

import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../Spotify';
import React, { useState, useCallback, useEffect } from 'react';

function App() {
  const [ searchResults, setSearchResults ] = useState([]);
  const [ playlistTracks, setPlaylistTracks ] = useState([]);
  const [ playlistName, setPlaylistName ] = useState('New Playlist');

  const search = useCallback((term) => {
    Spotify.search(term).then(setSearchResults);
  }, []);

  const updatePlaylistName = useCallback((name)=> {
    setPlaylistName(name)
  }, []);

  const addTrack = useCallback((track) => {
    //if the track was already saved to playlist, do nothing
    if (playlistTracks.some((savedTrack) => savedTrack.id === track.id)) {
      return;
    } else {
      //otherwise add to the playlist
      setPlaylistTracks((prev) => [track, ...prev])
    }
  }, [playlistTracks]) //need to add dependency because we're using it to check if track exist

  const removeTrack = useCallback((track) => {
    setPlaylistTracks((prev) => 
      prev.filter((currentTrack) => currentTrack.id !== track.id)
    );
  }, []) //no need to add dependency because it relies on react state setter callback

  const savePlaylist = useCallback(() => {
    const trackUris = playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris).then(() => {
      //once the playlist is saved, reset playlistName and playlistTracks
      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
    });
  }, [playlistName, playlistTracks]);

  //immediately retrieved access token as page load
  useEffect(() => {
    Spotify.getAccessToken(); // Start the flow when the component mounts
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div className={styles.app}>
      <h1>JAMMMING</h1>
      <SearchBar onSearch={search}/>
      <div className={styles.lists}>
        <div className={styles.resultContainer}>
          <SearchResults searchResults={searchResults} onAdd={addTrack}/>
        </div>
        <div className={styles.playlistContainer}>
          <Playlist 
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
            onRemove={removeTrack}  
          />
        </div>
      </div>
    </div>
  );
}

export default App;
