import { randomUUID } from "crypto";
import { Track } from "./../spotify/spotify";
import { User } from "./../user/user";

export class Room {
  private _players: User[] = []; // List of users
  private _id: string; // Room ID
  private _genres: string[] = []; // Define the gender of musics
  private _steps = 0; // Define the quantity of rounds

  trackList: Track[] = [];
  started: boolean;
  finished: boolean;

  owner: User;

  constructor(steps: number, owner: User, genres?: string[]) {
    this._id = randomUUID();
    this._steps = steps;

    this.started = false;
    this.finished = false;

    this.owner = owner;

    if (genres) {
      this.genres = genres;
    }
  }

  equals(room: Room): boolean {
    if (this._id === room.id) {
      return true;
    } else return false;
  }

  update(room: any) {
    this.genres = room.genres;
    this.steps = room.steps;
    this.started = room.started;
    this.finished = room.finished;
  }

  // return room on json format
  toJSON(): any {
    return {
      id: this._id,
      players: this._players,
      tracks: this.trackList,
      started: this.started,
      steps: this._steps,
      genres: this._genres,
    };
  }

  get players(): User[] {
    return this._players;
  }

  // Remove a player from a room
  removePlayer(playerName: String): void {
    let position = this._players.findIndex(
      (player) => player.name === playerName
    );
    this._players.splice(position, 1);
  }

  // Add a player to a room
  public addPlayer(player: User): void {
    if (this.players.length >= 8 || this.started) {
      throw new Error("No more players accepted");
    } else {
      this._players.push(player);
    }
  }

  public resetPlayers(): void {
    this._players = [];
  }

  public get id(): string {
    return this._id;
  }

  get genres(): any[] {
    return this._genres;
  }

  set genres(genres: any[]) {
    this._genres = genres;
  }

  get steps(): number {
    return this._steps;
  }

  set steps(steps: number) {
    this._steps = steps;
  }

  startRoom(): void {
    this.started = true;
  }
}
