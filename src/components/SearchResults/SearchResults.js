import React from 'react';
import Tracklist from '../Tracklist/Tracklist';
import styles from './SearchResults.module.css';

const SearchResults = (props) => {

    return (
        <div className={styles.searchResults}>
            <h2>Results</h2>
            <Tracklist tracks={props.searchResults} onAdd={props.onAdd}/>
        </div>
    )
}

export default SearchResults;