# Blindtest - Game Documentation

## Overview

**Blindtest** is a real-time, multiplayer music-based guessing game. The core objective is for players to identify the correct artist of a song presented in a multiple-choice format. The game is designed for high engagement, suitable for both individual play and large-scale events (e.g., in pubs or social gatherings).

## Gameplay Mechanics

### 1. Setup and Joining

- **Room Creation**: A host initiates a game session, which generates a unique 4-letter room code.
- **Joining**: Players access the **Player Interface** and enter the room code along with a nickname to join the session.
- **Real-time Communication**: The game uses `Socket.io` to maintain a persistent, bidirectional connection between the server and all participants, ensuring instant updates for everyone in the room.

### 2. The Challenge Loop

The gameplay follows a continuous loop of challenges:

1. **Song Selection**: The server randomly selects a song from a historical database (covering years 1960–2018).
2. **Dynamic Question Generation**:
   - The server identifies the correct artist for the selected song.
   - It then queries the **Deezer API** to find related artists.
   - A list of four options is presented to the players: the correct artist plus three "distractor" artists retrieved from the API.
   - The options are shuffled to ensure variety and difficulty.
3. **The Guess**: Players view the list of artists on their device and must click the name they believe corresponds to the song being played.
4. **Feedback and Scoring**:
   - **Correct Answer**: The player's score increases.
   - **Incorrect Answer**: The player receives feedback, and the game continues.
5. **Winning**: The first player to reach a predefined score (e.g., 10 points) is declared the winner of the round/game.

## Technical Architecture

### Backend (Node.js)

The backend manages the game state, player connections, and data orchestration.

- **`Game.js`**: Manages the active game state, rounds, and scoring logic.
- **`Room.js`**: Handles individual room instances, player lists, and broadcasting events.
- **`RoomManager.js`**: A singleton that manages the lifecycle of all active rooms, including automatic cleanup of inactive sessions.
- **`User.js`**: Manages player-specific data (username, score, connection status).
- **`Songs.js`**: The data access layer that pulls songs from local JSON files and coordinates with the Deezer API.
- **`Deezer.js`**: A wrapper for the Deezer API used to fetch metadata and related artists.

### Frontend

The project features two distinct web interfaces:

#### **Player Interface (`www/player/`)**

- **Purpose**: The primary interface for players to participate in the game.
- **Features**: Displays the current song's artist options, shows real-time score updates, and provides immediate feedback on guesses.
- **Technologies**: Vanilla JavaScript, `Zepto.js` (a lightweight jQuery alternative), and `Socket.io-client`.

#### **Monitor Interface (`www/monitor/`)**

- **Purpose**: A "spectator" view designed for large displays (e.g., projectors in a pub).
- **Features**:
  - Displays the current game progress and leaderboard.
  - Includes a QR code for easy player onboarding.
  - Features a visualizer for an immersive experience.
  - Provides a "room setup" view for hosts.
- **Technologies**: HTML5, CSS3, and `soundmanagerv2` for robust audio handling.

### Data Management

- **Historical Database**: A collection of JSON files in the `data/` directory containing song metadata (artist, title, year, rank) from 1960 to 2018.
- **External Enrichment**: The **Deezer API** is used dynamically during each round to fetch related artists, ensuring that the multiple-choice options are always relevant and challenging.

## Summary of Technologies

| Component                   | Technology                 |
| :-------------------------- | :------------------------- |
| **Runtime**                 | Node.js                    |
| **Real-time Communication** | Socket.io                  |
| **Frontend (Player)**       | JavaScript, Zepto.js       |
| **Frontend (Monitor)**      | HTML5, CSS3, SoundManager2 |
| **External API**            | Deezer API                 |
| **Data Source**             | Local JSON Archives        |
