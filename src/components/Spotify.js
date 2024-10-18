const clientId = '9ffe8bce45c146f6af5cf7e38b961aea'; // Insert client ID here.
const redirectUri = 'http://localhost:3000/callback'; // Have to add this to your accepted Spotify redirect URIs on the Spotify API.
let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        const savedSearchTerm = localStorage.getItem('search_term');

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1]; // Get the access token
            const expiresIn = Number(expiresInMatch[1]); // Expires in seconds
            window.setTimeout(() => accessToken = '', expiresIn * 1000); //reset access token after 
            window.history.pushState('Access Token', null, '/'); // Clear the URL parameters
            //remove savedSearchTerm from local storage
            if (savedSearchTerm) {
                localStorage.removeItem('search_term'); // Clear the saved search term after use
            }
            return accessToken;
        } else {
            //if there's no accessToken, trigger redirectToAuth method
            Spotify.redirectToAuth();
        }
    },

    //return userId
    getUserId() {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        return fetch(`https://api.spotify.com/v1/me`, {headers: headers}
        ).then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user information');
            }
            return response.json()
        }).then(JSONresponse => {
            if (!JSONresponse.id) {
                throw new Error('User ID is undefined');
            }
            return JSONresponse.id;
        })
    },

    // Redirect the user to the Spotify authorization page
    redirectToAuth() {
        const userInput = document.querySelector('input[type="text"]').value; // Get the user input if available
        if (userInput) {
            localStorage.setItem('search_term', userInput); // Save search term before redirect
        }
        const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
        window.location = accessUrl; // Refresh page once retrieved token
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            return response.json();
        }).then (JSONresponse => {
            if (!JSONresponse.tracks) {
                return [];
            }
            return JSONresponse.tracks.items.map((track) => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        });
    },

    //get user's existing playlists
    getPlaylists() {
        return Spotify.getUserId().then(userId=> {
            const accessToken = Spotify.getAccessToken();
            const headers = { Authorization: `Bearer ${accessToken}` };
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch playlists');
                }
                return response.json();
            }).then(JSONresponse => {
                if (!JSONresponse.items) {
                    return [];
                }
                return JSONresponse.items.map((playlist) => ({
                    id: playlist.id,
                    name: playlist.name,
                    totalTracks: playlist.tracks.total,
                }));
            }).catch(error => {
                console.error('Error fetching playlists:', error);
            });
        })
    },

    //get the tracks of specific playlist
    getPlaylistTracks(playlistId) {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {headers: headers}
        ).then(response => response.json()
        ).then( JSONresponse => {
            if (!JSONresponse.items) {
                return [];
            }
            return JSONresponse.items.map((item) => ({
                id: item.track.id,
                name: item.track.name,
                album: item.track.album.name,
                artist: item.track.artists[0].name,
                uri: item.track.uri,
            }));
        });
    },

    addItemsToPlaylist(trackUris, playlistId) {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({uris: trackUris})
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to add tracks to the playlist');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error saving updated playlist:', error);
            return Promise.reject('Error saving updated playlist');
        });
    },

    removeItemsFromPlaylist(trackUris, playlistId) {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
         // Map track URIs to the required format for the delete request
        const tracksToRemove = trackUris.map(uri => ({ uri })); // Convert URIs to the format expected by the API
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: headers,
            method: 'DELETE',
            body: JSON.stringify({ tracks: tracksToRemove })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to remove tracks from the playlist');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error saving updated playlist:', error);
            return Promise.reject('Error saving updated playlist');
        });
    },

    savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) {
            return Promise.reject('No name or tracks provided');
        }

        return Spotify.getUserId().then(userId=> {
            const accessToken = Spotify.getAccessToken();
            if (!accessToken) {
                return Promise.reject('No access token available'); // Exit early if the token is invalid
            }
            const headers = { Authorization: `Bearer ${accessToken}` };

            console.log("AccessToken: ", accessToken);
            console.log("Playlist name: ", name);
            
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: name})
            }).then(response => response.json()
            ).then(JSONresponse => {
                const playlistId = JSONresponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                });
            })
            .catch(error => {
                console.error('Error creating or saving playlist:', error);
            });
        })
    }
}

export default Spotify;