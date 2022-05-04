import { User } from "./../user/user";
import { Room } from "./room";
import { SpotifyService } from "../spotify/spotify-service";

const spotifyService = new SpotifyService();

export class RoomsService {
  public Rooms: Room[] = [];

  constructor() {}

  // Creates a room using infos from body request
  public async createRoom(steps: number, owner: User, name: string, gender?: string[]) {
    let newRoom = new Room(steps, owner, name, gender);
    newRoom.trackList = await spotifyService.getRecommendations();

    this.addRoom(newRoom);

    return newRoom;
  }

  public async restartRoom(roomName: string) {
    let room = this.Rooms.find((room) => room.name == roomName);

    if (room) {
      room.trackList = await spotifyService.getRecommendations();
      room.started = false;
      room.finished = false;
      room.resetPlayers();

      room.addPlayer(room.owner);
      return room;
    } else {
      throw new Error("Room not found");
    }
  }

  // Add the new room into the rooms list
  private addRoom(room: Room): void {
    this.Rooms.push(room);
  }

  // Get an especific room
  public getRoom(roomName: string): Room | undefined {
    return this.Rooms.find((room) => room.name === roomName);
  }

  // Get rooms list
  public getRooms(): Room[] {
    return this.Rooms;
  }

  // Find room by userName
  public getRoomsByUserName(userName: string): Room | undefined {
    return this.Rooms.find((room) => {
      room.players.some((playerElement) => playerElement.name === userName);
    });
  }

  // Find room by userId
  public getRoomsByUserId(userId: string): Room {
    const room = this.Rooms.find((room) => {
      const hasPlayer = room.players.some((playerElement) => playerElement.socketId === userId);
      const hasOwner = room.owner.socketId === userId;
      const functionReturn = hasPlayer || hasOwner;
      return functionReturn;
    });
    if (room) {
      return room;
    } else {
      throw new Error("Room not found");
    }
  }

  // Find room by Gender
  public getRoomsByGender(genderTracked: string): Room[] {
    return this.Rooms.filter((room) =>
      room.genres.find((gender) => gender === genderTracked)
    );
  }
}
