# Digai Game Server

## Node.js Server using express and Socket.io

## Introduction

This game is a project requested by our University (UFPE), developed and designed by students.

Our objective here is understand the different types of multimedia and discover the power of the internet.

Our idea was to create a game that would be played by one, two or more players.

You can understand more of the game in the Front-End Readme (will be added here later :D).

## Requirements

| Type                 | Description          |
| -------------------- | -------------------- |
| Node.js              | Server               |
| Express              | Server               |
| Socket.io            | Server               |
| Nodemon              | Server (Development) |
| spotify-web-api-node | Spotify API          |
| TypeScript           | Server               |

## Installation

Run the following command in your terminal:

```shell
npm install
```

Now you can run the server with the following command:

```shell
nodemon index.ts
```

_OBS_: Nodemon is only for development purposes. If you want to run the server in production, you can run the following command:

```shell
node index.ts
```

## How to play with friends?

We can use ngrok to share the server with other people.

You can check ngrok documentation [here](ngrok.com).

## Usage

### Routes

| Route             | Type |
| ----------------- | ---- |
| /                 | GET  |
| /api/create-room  | POST |
| /api/join-room    | POST |
| /api/exit-room    | POST |
| /api/fetch-rooms  | GET  |
| /api/update-room  | PUT  |
| /api/restart-room | PUT  |

#### Especifications

##### `POST` /api/create-room

`Body`

```json
  "steps": number (required),
  "owner": {
            "name": string (required),
            "crowns": number (optional),
            },
  "genres": string[] (optional),
```

- The back-end will generate an Unique ID to indentify the room that will be returned.

`Response`

```json
  "id": UUID,
  "players": string[],
  "tracks": track_list[],
  "started": boolean,
  "steps": number,
  "genres": string[],
```

##### `POST` /api/join-room

`Body`

```json
  "roomID": UUID (required),
  "user": {
    "name": string (required),
    "crowns": number (optional)
  }
```

- Crowns: Actual number of victories.

`Response`

```json
  "id": UUID,
  "players": string[],
  "tracks": track_list[],
  "started": boolean,
  "steps": number,
  "genres": string[],
```

##### `GET` /api/fetch-rooms

`Response`

```json
  [
    "id": UUID,
    "players": string[],
    "tracks": track_list[],
    "started": boolean,
    "steps": number,
    "genres": string[],
  ]
```

##### `POST` /api/exit-room

`Body`

```json
  "roomId": UUID, (required)
  "user": string, (required)
```

`Response`

```json
  "status": 200 | 404,
  "message": string,
```

##### `PUT` /api/update-room

`Body`

```json
  "roomId": UUID, (required)
  "room": {
    "started": boolean, (required)
    "steps": number, (required)
    "genres": string[], (required)
    "finished": boolean, (required)
  }
```

> Even if not changed all the informations, all of them need to be sent.

`Response`

```json
  "id": UUID,
  "players": string[],
  "tracks": track_list[],
  "started": boolean,
  "steps": number,
  "genres": string[],
```

##### `POST` /api/restart-room

`Body`

```json
  "roomId": UUID, (required)
```

`Response`

```json
  "status": 200 | 404,
  "message": string,
```

## Patchnotes

23/04/2022:

- Arthur (thurcst):
  - Created all interfaces to be used in the project.
  - Created all classes to be used in the project.
  - Choosed the best way to organize the project.
  - Picked one library to (not) implement Spotify API.
  - Added the `/` route to be the test page.
  - Added the `/api/test-websocket` route to test websocket.
  - Added the `/api/create-room` route.
  - Added the `/api/fetch-rooms` route.
  - Added the `/api/join-room` route.
  - Added the `/api/exit-room` route.
  - Added the `/api/update-room` route.
  - Added the `/api/restart-room` route.

11/05/2022:

- Arthur (thurcst):
  - After our infrastructure change, we decided to use WebSocket protocol instead of http calls.
  - Added the `stop` and `trackAssert` events on websocket.
    - The `stop` event will be fired when the user stops the game.
    - The `trackAssert` event will be fired after the stop, to make players send their crowns.
  - Created the result attribute on room class.
  - Deleted old stop implementation.
  - Created the `disconnect` routine on websocket.
    - The `disconnect` routine will be fired when the user disconnects from the server.
      - We remove player from room if he is in one.
