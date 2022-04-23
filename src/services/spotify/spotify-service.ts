import { Track } from "./spotify";
const SpotifyWebApi = require("spotify-web-api-node");

export class SpotifyService {
  client_id = "705102acdb8e43609a1d8920dc8f371d";
  client_secret = "f3caa2b75f5b47d1b879336e181229a4";
  redirect_uri = "http://localhost:3000/";

  genres = [
    "acoustic",
    "afrobeat",
    "alt-rock",
    "alternative",
    "ambient",
    "anime",
    "black-metal",
    "bluegrass",
    "blues",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "cantopop",
    "chicago-house",
    "children",
    "chill",
    "classical",
    "club",
    "comedy",
    "country",
    "dance",
    "dancehall",
    "death-metal",
    "deep-house",
    "detroit-techno",
    "disco",
    "disney",
    "drum-and-bass",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electronic",
    "emo",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "guitar",
    "happy",
    "hard-rock",
    "hardcore",
    "hardstyle",
    "heavy-metal",
    "hip-hop",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "indie-pop",
    "industrial",
    "iranian",
    "j-dance",
    "j-idol",
    "j-pop",
    "j-rock",
    "jazz",
    "k-pop",
    "kids",
    "latin",
    "latino",
    "malay",
    "mandopop",
    "metal",
    "metal-misc",
    "metalcore",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "pop",
    "pop-film",
    "post-dubstep",
    "power-pop",
    "progressive-house",
    "psych-rock",
    "punk",
    "punk-rock",
    "r-n-b",
    "rainy-day",
    "reggae",
    "reggaeton",
    "road-trip",
    "rock",
    "rock-n-roll",
    "rockabilly",
    "romance",
    "sad",
    "salsa",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "synth-pop",
    "tango",
    "techno",
    "trance",
    "trip-hop",
    "turkish",
    "work-out",
    "world-music",
  ];

  spotifyApi = new SpotifyWebApi({
    clientId: this.client_id,
    clientSecret: this.client_secret,
    redirectUri: this.redirect_uri,
  });

  constructor() {
    this.getAccessToken();
  }

  private getAccessToken() {
    this.spotifyApi.clientCredentialsGrant().then((data: any) => {
      console.log("Token Access Generated!");
      this.spotifyApi.setAccessToken(data.body["access_token"]);
    });
  }

  private parseResponse(data: any): Track[] {
    let track: Track;
    let track_list: Track[] = [];

    data.tracks.forEach((element: any) => {
      if (element.preview_url) {
        track = {
          name: element.name,
          artist: element.artists[0].name,
          album: element.album.name,
          album_art: element.album.images[0].url,
          preview_url: element.preview_url,
          uri: element.uri,
        };

        track_list.push(track);
      }
    });

    return track_list;
  }

  public async getRecommendations() {
    let recommendations: Track[] = [];

    if (!this.spotifyApi.getAccessToken()) {
      this.getAccessToken();
    }

    await this.spotifyApi
      .getRecommendations({
        seed_artists: ["1elUiq4X7pxej6FRlrEzjM", "0hPar6ePAELiu9rYMdvMEo"],
        min_popularity: 50,
      })
      .then(
        (data: any) => {
          recommendations = this.parseResponse(data.body);
          //   console.log(recommendations);
        },
        (err: any) => {
          console.log("Something went wrong!", err);
        }
      );

    return recommendations;
  }
}
