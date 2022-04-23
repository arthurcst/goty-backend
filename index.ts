import express, { Application, Request, Response } from "express";
import * as io from "socket.io";
import { Server } from "http";

import { SpotifyService } from "./src/services/spotify/spotify-service";

const path = require("path");

const port = 3000;
const app: Application = express();
const http = new Server(app);
const socketio = new io.Server(http);
const spotifyService = new SpotifyService();

socketio.on("connection", (socket) => {
  console.log("User connected");

  socket.send("Welcome to the socketio server");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req: Request, res: Response) => {
  var options = {
    root: path.join(__dirname),
  };

  console.log("Received");

  res.sendFile("./index.html", options);
});

app.get("/callback", async (req: Request, res: Response) => {
  console.log(req, res);
});

app.get("/spotify", async (req: Request, res: Response) => {
  let recommendations = await spotifyService.getRecommendations();

  console.log(recommendations);

  return res.send(recommendations);
});

http.listen(port, (): void => {
  console.log(`Connected successfully on port ${port}`);
});
