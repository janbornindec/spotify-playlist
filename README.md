# Getting Started with Create React App

This project was one of the portfolio projects from CodeCademy Full Stack Developer course.

## Purpose of this project
To build a React web application that allows users to search the Spotify library, create a custom playlist, then save it to their Spotify account.

## Features
- Users can search for songs by song title.
- Users can see information about each song like title, artist, and album for songs they queried
- Users can export their custom playlist to their personal Spotify account
  
## What I've Learned
- useCallBack(): This is used to memoize a function so that it only gets re-created when its dependencies change. This can help with performance optimization, particularly in scenarios where passing callbacks to child components or triggering side effects could cause unnecessary re-renders.
- window.history.pushState(): This method adds a new entry to browser's history stack. It takes three parameters: state object (associated with the new history entry. Can be used to store information about current state), title (generally ignored by most browsers), and URL (Ideally same origin as current page, but can change the part part of the URL).
- localStorage: Learned to save item to local storage and delete them with setItem and removeItem. Used this to save savedSearchTerm and immediately redirect to accessUrl on page load so users don't have to search twice.
