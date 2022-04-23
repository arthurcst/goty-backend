export class User {
  private _name: string;
  private _crowns = 0;

  constructor(name: string, crowns?: number) {
    this._name = name;
    this._crowns = crowns ? crowns : 0;
  }

  get name(): string {
    return this._name;
  }

  get crowns(): number {
    return this._crowns;
  }

  set crowns(crowns: number) {
    this._crowns = crowns;
  }
}
