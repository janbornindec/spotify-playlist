import React, { useEffect, useState } from "react";
import styles from './PlaylistList.module.css'
import Tracklist from "../Tracklist/Tracklist";

const PlaylistList = (props) => {
    // State to manage which playlists are expanded
    const [expandedPlaylists, setExpandedPlaylists] = useState({});

    // Function to toggle playlist expansion
    const togglePlaylist = (id) => {
        setExpandedPlaylists(prev => ({
            ...prev,
            [id]: !prev[id] // Toggle the boolean value for the clicked playlist
        }));
        props.handleClick(id);
    };

    return (
        <div className={styles.playlistList}>
            <h2>Playlists</h2>
            <div className={styles.playlist}>
                <ul>
                    {props.playlists.map((playlist) => (
                        <li key={playlist.id}>
                            <h3 className={styles.playlistTitle} onClick={()=>togglePlaylist(playlist.id)}>
                                {playlist.name}
                            </h3> 
                            { expandedPlaylists[playlist.id] && (
                                <div className={styles.tracklists}>
                                    <Tracklist
                                        tracks={props.playlistListTracks}
                                        isRemoval={true}
                                        onRemove={props.onRemove}
                                    />
                                    <button className={styles.save} onClick={props.onUpdate}>
                                        Update Playlist
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default PlaylistList;