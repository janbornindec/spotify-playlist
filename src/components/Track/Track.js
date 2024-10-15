import React, { useCallback } from 'react';
import styles from './Track.module.css';

const Track = (props) => {
    const addTrack = useCallback((e) => {
            props.onAdd(props.track);
        },
        [props.onAdd, props.track]
    );

    const removeTrack = useCallback((e) => {
            props.onRemove(props.track);
        }, 
        [props.onRemove, props.track]
    );

    const renderAction = () => {
        if (props.isRemoval) {
            return (
                <button onClick={removeTrack}>-</button>
            );
        };
        return (
            <button onClick={addTrack}>+</button>
        );
    };

    return (
        <div className={styles.track}>
            <h3>{props.track.name}</h3>
            <div className={styles.body}>
                <p>
                    {props.track.artist} | {props.track.album}
                </p>
                { renderAction() }
            </div>
        </div>
    )
}

export default Track;