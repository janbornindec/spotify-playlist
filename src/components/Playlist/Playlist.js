import React, {useCallback} from "react";
import Tracklist from "../Tracklist/Tracklist";
import styles from './Playlist.module.css'

const Playlist = (props) => {
    const handleNameChange = useCallback(
        (event) => {
            props.onNameChange(event.target.value);
        },
        [props.onNameChange]
    )

    return (
        <div className={styles.playlist}>
            <input onChange={handleNameChange} defaultValue="New Playlist"/>
            <Tracklist
                tracks={props.playlistTracks}
                isRemoval={true}
                onRemove={props.onRemove}
            />
            <button className={styles.save} onClick={props.onSave}>Save to Spotify</button>
        </div>
    )
}

export default Playlist;