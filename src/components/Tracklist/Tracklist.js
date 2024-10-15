import React from 'react';
import Track from '../Track/Track';
import styles from './Tracklist.module.css'

const Tracklist = (props) => {
    return (
        <div className={styles.tracklist}>
            {props.tracks.map((track) => {
            return (
                    <Track
                        track={track}
                        key={track.id}
                        onAdd={props.onAdd}
                        isRemoval={props.isRemoval}
                        onRemove={props.onRemove}
                    />
                );
            })}
        </div>
    )
}

export default Tracklist;