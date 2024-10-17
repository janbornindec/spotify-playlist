import userEvent from "@testing-library/user-event";

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

    redirectToAuth() {
        // Redirect the user to the Spotify authorization page
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

    savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) {
            return Promise.reject('No name or tracks provided');
        }

        const accessToken = Spotify.getAccessToken();
        if (!accessToken) {
            return Promise.reject('No access token available'); // Exit early if the token is invalid
        }
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userId;

        console.log("AccessToken: ", accessToken);
        console.log("Playlist name: ", name);
        
        return fetch('https://api.spotify.com/v1/me', {headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: name})
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                });
            })
            .catch(error => {
                console.error('Error creating or saving playlist:', error);
            });
        });
    }
}

export default Spotify;