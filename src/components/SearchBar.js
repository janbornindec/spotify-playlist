import React, { useCallback, useEffect, useState } from 'react';

const SearchBar = () => {
    const [ search, setSearch ] = useState('');

    //useCallBack to prevent rerender when dependencies haven't changed
    const onChangeHandler = useCallback((e) => {
        setSearch(e.target.value);
    }, []);

    const onClickHandler = () => {
        if (search !== '') {
            //get data
        } else {
            alert("Please enter a search term.")
        }
    }

    return (
        <div>
            <input placeholder='Enter track title here' value={search} onChange={onChangeHandler}/>
            <button onClick={onClickHandler}>Search</button>
        </div>
    )
}

export default SearchBar;