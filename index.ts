import { User } from "./src/services/user/user";
import express, { Application, Request, Response } from "express";
import * as io from "socket.io";
import { Server } from "http";

import { RoomsService } from "./src/services/rooms/rooms-service";

const path = require("path");

const port = 3000;
const app: Application = express();
const http = new Server(app);
const socketio = new io.Server(http);

const roomsService = new RoomsService();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

socketio.on("connection", (socket) => {
  console.log(socket.id, " connected Websocket");

  socket.on("start", (callback) => {
    try {
      const room = roomsService.getRoomsByUserId(socket.id);
      const trackList = JSON.stringify(room?.trackList.slice(0, room.steps));

      if (room) {
        socket.to(room.name).emit("propagate-start", trackList);

        console.log("room", room.name, "started");

        callback(trackList);
      }
    } catch (error) {
      callback(error);
    }
  });

  socket.on("stop", (cb) => {
    try {
      const room = roomsService.getRoomsByUserId(socket.id);
      if (room) {
        const user = room.findPlayerById(socket.id);

        socket.to(room.name).emit("propagate-stop");

        cb("stopped");
      }
    } catch (error) {
      cb(error);
    }
  });

  socket.on("create-room", (roomName, userName, steps, cb) => {
    try {
      const user = new User(userName, socket.id);
      const room = roomsService.getRoom(roomName);

      if (room) {
        cb("room already exists");
      } else {
        const newRoom = roomsService.createRoom(steps, user, roomName);

        newRoom.then((roomElement) => {
          socket.join(roomName);
          cb(roomName);
          console.log(userName, "created", roomName);
        });
      }
    } catch (error) {
      cb(error);
    }
  });

  socket.on("join-room", (roomName, userName, cb) => {
    try {
      const user = new User(userName, socket.id);
      const room = roomsService.getRoom(roomName);

      if (room) {
        room.addPlayer(user);
        socket.join(roomName);

        const players = room.players.map(function (p) {
          return p.name;
        });

        socket.to(room.name).emit("room-update", players);

        cb(players);

        console.log(userName, "entered room", roomName);
        console.log(room?.players);
      } else {
        cb("room dos not exist");
      }
    } catch (error) {
      cb(error);
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id, " disconnected Websocket");

    try {
      const room = roomsService.getRoomsByUserId(socket.id);

      if (room) {
        room.removePlayer(socket.id);
        socket.leave(room.name);
        socket.to(room.name).emit("room-update", room.players);
      }
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("trackAssert", (songList: string[], cb) => {
    try {
      const room = roomsService.getRoomsByUserId(socket.id);

      if (room) {
        const user = room.findPlayerById(socket.id);
        const trackList = room.trackList;

        let score = 0;

        songList.forEach((song, index) => {
          if (song) {
            let trackName = "";

            if (trackList[index].name.indexOf("(") > -1) {
              trackName = trackList[index].name
                .toLowerCase()
                .substring(0, trackList[index].name.indexOf("("));
            }

            if (
              trackList[index].name.toLowerCase().indexOf(" - ao vivo") > -1
            ) {
              trackName = trackList[index].name
                .toLowerCase()
                .substring(0, trackList[index].name.indexOf(" - ao vivo"));
            }

            if (
              trackList[index].name.indexOf("(") == -1 &&
              trackList[index].name.toLowerCase().indexOf(" - ao vivo") == -1
            ) {
              trackName = trackList[index].name.toLowerCase();
            }

            let percent = trackName.length / song.length;

            if (trackName.indexOf(song.toLowerCase()) > -1 && percent > 0.5) {
              console.log("Acertou");
              score++;
            }
          }
        });

        room.findPlayerById(socket.id).crowns = score;
        room.result = [{ name: user.name, crowns: score }];

        let sorted = room.result.sort((a, b) => b.crowns - a.crowns);

        if (room.result.length === room.players.length) {
          console.log(room.name);
          socket.to(room.name).emit("resume", JSON.stringify(sorted));
          console.log("resume event sent!");
          cb(JSON.stringify(sorted));
        }
      } else {
        cb("Room not found");
      }
    } catch (e) {
      console.error(e);
    }
  });
});

// GET: / - return an HTML for intern tests
app.get("/", async (req: Request, res: Response) => {
  // Includes the user on socketio server
  // socketio.emit("user", "User connected test");

  res.sendFile(path.join(__dirname, "index.html"));
});

// POST: /api/exit-room - remove an user from a room
// Idea: not only the user can leave
// but also the room owner can remove the user
app.post("/api/exit-room", async (req: Request, res: Response) => {
  let body = req.body;

  let room = roomsService.getRoom(body.roomId);

  if (room) {
    try {
      room.removePlayer(body.user);
      res.status(200);
    } catch (error) {
      res.send("Player not found");
      res.status(404);
    }
  } else {
    res.send("Room not found");
    res.status(404);
  }
});

// POST: /api/restart-room - Reset the room state and create a new Tracklist
app.post("/api/restart-room", async (req: Request, res: Response) => {
  let body = req.body;

  let room = await roomsService.restartRoom(body.roomId);

  if (room) {
    res.send(room.toJSON());
    res.status(200);
  } else {
    res.send("Room not found");
    res.status(404);
  }
});

// GET: /callback - Callback from the payment
app.get("/callback", async (req: Request, res: Response) => {
  console.log(req, res);
});

// POST: /api/test-websocket - Throw a message to all clients
app.post("/api/test-websocket", (req: Request, res: Response) => {
  const body = req.body;

  socketio.sockets.emit("message", body.message);

  res.send("Message sent");
});

http.listen(port, (): void => {
  console.log(
    `Server started, listening on port ${port}.\nAwait some seconds to start the Spotify instance...`
  );
});
