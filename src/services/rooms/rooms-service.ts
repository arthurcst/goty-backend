import { User } from "./../user/user";
import { Room } from "./room";
import { SpotifyService } from "../spotify/spotify-service";

const spotifyService = new SpotifyService();

export class RoomsService {
  public Rooms: Room[] = [];

  constructor() {}

  // Creates a room using infos from body request
  public async createRoom(steps: number, owner: User, gender?: string[]) {
    let newRoom = new Room(steps, owner, gender);
    newRoom.trackList = await spotifyService.getRecommendations();

    this.addRoom(newRoom);

    return newRoom;
  }

  public async restartRoom(roomId: string) {
    let room = this.Rooms.find((room) => room.id == roomId);

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
  public getRoom(roomId: string): Room | undefined {
    return this.Rooms.find((room) => room.id === roomId);
  }

  // Get rooms list
  public getRooms(): Room[] {
    return this.Rooms;
  }

  // Find room by Owner name
  public getRoomsByUser(user: string): Room[] {
    return this.Rooms.filter((room) => room.owner.name === user);
  }

  // Find room by Gender
  public getRoomsByGender(genderTracked: string): Room[] {
    return this.Rooms.filter((room) =>
      room.genders.find((gender) => gender === genderTracked)
    );
  }
}
