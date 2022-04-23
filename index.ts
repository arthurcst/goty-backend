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
  console.log("User connected");

  socket.send("ID: 112");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("message", (message) => {
    console.log(message);
  });
});

// GET: /test-websocket - Throw a message to all clients
app.get("/test-websocket", (req: Request, res: Response) => {
  res.send("Hello World!");

  socketio.sockets.emit("message", "Hello World");
});

// GET: to root return an HTML for intern tests
app.get("/", async (req: Request, res: Response) => {
  // Includes the user on socketio server
  socketio.emit("user", "User connected");

  res.sendFile(path.join(__dirname, "index.html"));
});

// POST: /create-room - Create a new room
app.post("/create-room", async (req: Request, res: Response) => {
  let body = req.body;

  let owner = new User(body.owner.name, body.owner.crowns);

  let room = roomsService.createRoom(body.steps, owner, body.genders);

  room.then((room) => {
    res.send(room.toJSON());
  });
});

// GET: /fetch-rooms - Return a list with all rooms
app.get("/fetch-rooms", async (req: Request, res: Response) => {
  const rooms = roomsService.getRooms();
  res.send(rooms);
});

// POST: /join-room - join a room and return the infos
app.post("/join-room", async (req: Request, res: Response) => {
  let body = req.body;

  let room = roomsService.getRoom(body.roomId);

  if (room) {
    room.addPlayer(body.user);
    res.send(room.toJSON());
    res.status(200);
  } else {
    res.send("Room not found");
    res.status(404);
  }
});

// POST: /exit-room - remove an user from a room
// Idea: not only the user can leave
// but also the room owner can remove the user
app.post("/exit-room", async (req: Request, res: Response) => {
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

// GET: /callback - Callback from the payment
app.get("/callback", async (req: Request, res: Response) => {
  console.log(req, res);
});

http.listen(port, (): void => {
  console.log(`Connected successfully on port ${port}`);
});
