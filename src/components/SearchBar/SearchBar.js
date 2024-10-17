import React, { useCallback, useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = (props) => {
    const [ searchTerm, setSearchTerm ] = useState('');

    //useCallBack to prevent rerender when dependencies haven't changed
    const onChangeHandler = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    //once user click search, trigger the onSearch prop from SearchBar in App.js
    //only rerender when onSearch func and/or searchTerm changes
    const onClickHandler = useCallback(() => {
        props.onSearch(searchTerm);
    }, [props.onSearch, searchTerm]);
    

    return (
        <div className={styles.searchBar}>
            <input type="text" placeholder='Enter track title here' value={searchTerm} onChange={onChangeHandler}/>
            <button onClick={onClickHandler}>SEARCH</button>
        </div>
    )
}

export default SearchBar;