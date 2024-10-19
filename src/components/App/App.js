import styles from './App.module.css';
import React, { useState, useCallback, useEffect } from 'react';

import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../Spotify';
import PlaylistList from '../PlaylistList/PlaylistList';

function App() {
  const [ searchResults, setSearchResults ] = useState([]);
  const [ newPlaylistTracks, setNewPlaylistTracks ] = useState([]);
  const [ playlistName, setPlaylistName ] = useState('New Playlist');
  const [ playlistList, setPlaylistList ] = useState([]); // For storing user's playlists
  const [ selectedPlaylistId, setSelectedPlaylistId ] = useState(null); // To track selected playlist
  const [ showNewPlaylist, setShowNewPlaylist ] = useState(false); // To control visibility
  const [ showExistingPlaylists, setShowExistingPlaylists ] = useState(false); // To control visibility
  const [ removedTrackUris, setRemovedTrackUris ] = useState([]); // New state to track removed tracks
  const [ tempPlaylistTracks, setTempPlaylistTracks ] = useState([]); // Temporary tracks state

  const handleRefresh = () => {
    window.location.reload();
  } 

  const search = useCallback((term) => {
    Spotify.search(term).then(setSearchResults);
  }, []);

  const updatePlaylistName = useCallback((name)=> {
    setPlaylistName(name)
  }, []);

  const addTrackToNewPlaylist = useCallback((track) => {
    //if the track was already saved to playlist, do nothing
    if (!newPlaylistTracks.some((savedTrack) => savedTrack.id === track.id)) {
      setNewPlaylistTracks((prev) => [track, ...prev]);
    }
  }, [newPlaylistTracks]) //need to add dependency because we're using it to check if track exist

  const removeTrackFromNewPlaylist = useCallback((track) => {
    setNewPlaylistTracks((prev) => 
      prev.filter((currentTrack) => currentTrack.id !== track.id)
    );
  }, []) //no need to add dependency because it relies on react state setter callback

  const saveNewPlaylist = useCallback(() => {
    const trackUris = newPlaylistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris).then(() => {
      //once the playlist is saved, reset playlistName and playlistTracks
      setPlaylistName("New Playlist");
      setNewPlaylistTracks([]);

      // Fetch updated playlist list and update state
      Spotify.getPlaylists().then((updatedPlaylists) => {
        setPlaylistList(updatedPlaylists);
      });
    });
  }, [playlistName, newPlaylistTracks]);

  const removeTrackFromExistingPlaylist = useCallback((track)=> {
    setTempPlaylistTracks((prev) =>
      prev.filter((currentTrack) => currentTrack.id !== track.id)
    );
    setRemovedTrackUris((prev) => [...prev, track.uri]);
  }, []);

  const addTrackToExistingPlaylist = useCallback((track) => {
    if (!tempPlaylistTracks.some((savedTrack) => savedTrack.id === track.id)) {
      setTempPlaylistTracks((prev) => [...prev, track]);
    }
  }, [tempPlaylistTracks]);

  const handleAddTrack = (track) => {
    if (showNewPlaylist) {
      addTrackToNewPlaylist(track);
    } else if (showExistingPlaylists && selectedPlaylistId) {
      addTrackToExistingPlaylist(track);
    } else {
      alert('Please select a playlist');
    }
  };

  const updatePlaylist = useCallback(() => {
    Spotify.getPlaylistTracks(selectedPlaylistId).then(existingPlaylistTracks => {
      const existingTrackIds = existingPlaylistTracks.map(track => track.id);

      // Determine which tracks should be added: those in selectedPlaylistTracks
      // that are NOT already present in the existing playlist
      const trackUrisToAdd = tempPlaylistTracks
        .filter(track => !existingTrackIds.includes(track.id))
        .map(track => track.uri);

      const trackUrisToRemove = removedTrackUris;

      console.log("Track URIs to Add:", trackUrisToAdd);
      console.log("Track URIs to Remove:", trackUrisToRemove);

      if (trackUrisToAdd.length > 0) {
        Spotify.addItemsToPlaylist(trackUrisToAdd, selectedPlaylistId)
        .then(()=>{
          console.log('Tracks added successfully');
          /*setSelectedPlaylistTracks(prev => [
            ...prev,
            ...selectedPlaylistTracks.filter(track => trackUrisToAdd.includes(track.uri))
          ]);*/
        })
        .catch(error => {
          console.log('Error adding tracks:', error);
        });
      };
      
      if (trackUrisToRemove.length > 0) {
        Spotify.removeItemsFromPlaylist(trackUrisToRemove, selectedPlaylistId)
        .then(() => {
          console.log('Tracks removed successfully');
          /*setSelectedPlaylistTracks(prev => 
            prev.filter(track => !trackUrisToRemove.includes(track.uri)) // Update local state
          );*/
        })
        .catch(error => {
          console.log('Error removing tracks:', error);
        });
      }
    });
    alert('Playlist updated!');
  }, [tempPlaylistTracks, removedTrackUris, selectedPlaylistId]);

  //immediately retrieved access token as page load
  useEffect(() => {
    Spotify.getAccessToken(); // Start the flow when the component mounts
    Spotify.getPlaylists().then(setPlaylistList); //get user's existing playlists
  }, []); // Empty dependency array means this runs once when the component mounts

  // Fetch tracks of the selected playlist
  const handlePlaylistClick = (playlistId) => {
    setSelectedPlaylistId(playlistId); // Set selected playlist ID
    Spotify.getPlaylistTracks(playlistId).then(tracks => {
      setTempPlaylistTracks(tracks); // Initialize temp tracks with existing tracks
    });
  };

  const toggleNewPlaylist = () => {
    setShowNewPlaylist((prev) => !prev);
    setShowExistingPlaylists(false);
  }

  const toggleExistingPlaylists = () => {
    setShowExistingPlaylists((prev) => !prev);
    setShowNewPlaylist(false);

    // Fetch the updated list of playlists when toggling
    if (!showExistingPlaylists) { // Only fetch if we're showing the list
      Spotify.getPlaylists().then(setPlaylistList);
    }
  }

  return (
    <div className={styles.app}>
      <button className={styles.title} onClick={handleRefresh}>JA<span style={{color: 'rgb(56, 9, 210)'}}>MMM</span>ING</button>
      <SearchBar onSearch={search}/>
      <div className={styles.lists}>
        <div className={styles.leftContainer}>
          <SearchResults
            searchResults={searchResults}
            onAdd={handleAddTrack}
          />
        </div>
        <div className={styles.rightContainer}>
          <button className={styles.btn} onClick={toggleNewPlaylist}>+ Create Playlist</button>
          <button className={styles.btn} onClick={toggleExistingPlaylists}>Your Playlists</button>
          {showNewPlaylist && (
            <Playlist
              playlistName={playlistName}
              playlistTracks={newPlaylistTracks}
              onNameChange={updatePlaylistName}
              onSave={saveNewPlaylist}
              onRemove={removeTrackFromNewPlaylist}
            />
          )}
          {showExistingPlaylists && (
            <PlaylistList 
              playlists={playlistList}
              playlistListTracks={tempPlaylistTracks}
              handleClick={handlePlaylistClick}
              onRemove={removeTrackFromExistingPlaylist}  
              onUpdate={updatePlaylist}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
