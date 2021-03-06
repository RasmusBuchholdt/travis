import { Promise } from 'bluebird';
import { Buffer } from 'buffer';

import { arrayContains, determineDeviceType, getStringNumber } from './utils';

let request = require('request-promise');
let querystring = require('querystring');

let config = require("../../config/app.json");

export class Spotify {

    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    };

    validateToken() {
        let options: {} = {
            method: "GET",
            uri: "https://api.spotify.com/v1/me/player",
            json: true,
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };

        return new Promise((resolve: any, reject: any) => {
            request(options)
                .then(result => {
                    resolve(true);
                })
                .catch(error => {
                    resolve(false);
                });
        });
    }

    handleAction(action: string) {
        let words: string[] = [];
        words = action.toLowerCase().split(" ");
        if (arrayContains(words, ["play"])) {
            this.playTrack(action);
        } else if (arrayContains(words, ["resume", "start"])) {
            this.resume();
        } else if (arrayContains(words, ["stop", "pause"])) {
            this.pause();
        } else if (arrayContains(words, ["next", "skip"])) {
            this.next();
        } else if (arrayContains(words, ["previous"])) {
            this.previous();
        } else if (arrayContains(words, ["shuffle", "random"])) {
            this.shuffle();
        } else if (arrayContains(words, ["restart", "replay", "repeat"])) {
            this.restart();
        } else if (arrayContains(words, ["down"])) {
            this.volumeDown(getStringNumber(action, 10));
        } else if (arrayContains(words, ["up"])) {
            this.volumeUp(getStringNumber(action, 10));
        } else if (arrayContains(words, ["seek", "jump"])) {
            this.seek(getStringNumber(action, null));
        } else if (arrayContains(words, ["pc", "computer", "laptop", "mobile", "phone", "smartphone", "tv", "television", "speaker", "speakers"])) {
            this.transferPlayback(words);
        }
    }

    private previous() {
        let options: {} = {
            method: "POST",
            uri: "https://api.spotify.com/v1/me/player/previous",
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };
        request(options);
    }

    private next() {
        let options: {} = {
            method: "POST",
            uri: "https://api.spotify.com/v1/me/player/next",
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };
        request(options);
    }

    private resume() {
        let options: {} = {
            method: "PUT",
            uri: "https://api.spotify.com/v1/me/player/play",
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };
        request(options);
    }

    private pause() {
        let options: {} = {
            method: "PUT",
            uri: "https://api.spotify.com/v1/me/player/pause",
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };
        request(options);
    }

    private shuffle() {
        this.getPlayback().then(result => {
            let choice: boolean = result.shuffle_state = !result.shuffle_state;
            let options: {} = {
                method: "PUT",
                uri: `https://api.spotify.com/v1/me/player/shuffle?state=${choice}`,
                headers: {
                    Authorization: ` Bearer ${this.accessToken}`
                }
            };
            request(options);
        });
    }

    private restart() {
        let options: {} = {
            method: "PUT",
            uri: "https://api.spotify.com/v1/me/player/seek?position_ms=0",
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };
        request(options);
    }

    private seek(position: number) {
        if (!position) return;
        let options: {} = {
            method: "PUT",
            uri: `https://api.spotify.com/v1/me/player/seek?position_ms=${position * 1000}`,
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };
        request(options);
    }

    private volumeUp(amount: number = null) {
        this.getPlayback().then(result => {
            let options: {} = {
                method: "PUT",
                uri: `https://api.spotify.com/v1/me/player/volume?volume_percent=${result.device.volume_percent + amount || 10}`,
                headers: {
                    Authorization: ` Bearer ${this.accessToken}`
                }
            };
            request(options);
        });
    }

    private volumeDown(amount: number = null) {
        this.getPlayback().then(result => {
            let options: {} = {
                method: "PUT",
                uri: `https://api.spotify.com/v1/me/player/volume?volume_percent=${result.device.volume_percent - amount || 10}`,
                headers: {
                    Authorization: ` Bearer ${this.accessToken}`
                }
            };
            request(options);
        });
    }

    private transferPlayback(words: string[]) {
        let deviceTypeChoice: string = determineDeviceType(words);
        if (!deviceTypeChoice) return;
        this.getDevices().then(result => {
            let deviceChoice: string;
            result.forEach(device => {
                if (device.type.toLowerCase() == deviceTypeChoice && device.is_active == false)
                    deviceChoice = device.id;
            });
            if (!deviceChoice) return;
            let options: {} = {
                method: "PUT",
                uri: `https://api.spotify.com/v1/me/player`,
                headers: {
                    Authorization: ` Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    device_ids: [
                        deviceChoice
                    ]
                })
            };
            request(options);
        });
    }

    private playTrack(query: string) {
        this.getTrack(query).then(result => {
            let maxPopularity: number = 0;
            let trackChoice: string;
            result.forEach(track => {
                if (track.popularity > maxPopularity) {
                    maxPopularity = track.popularity;
                    trackChoice = track.uri;
                }
            });
            if (!trackChoice) return;
            let options: {} = {
                method: "PUT",
                uri: `https://api.spotify.com/v1/me/player/play`,
                headers: {
                    Authorization: ` Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    uris: [trackChoice]
                })
            };
            request(options);
        });
    }

    private getPlayback() {
        let options: {} = {
            method: "GET",
            uri: "https://api.spotify.com/v1/me/player",
            json: true,
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };

        return new Promise((resolve: any, reject: any) => {
            request(options)
                .then(result => {
                    resolve(result);
                });
        });
    }

    private getDevices() {
        let options: {} = {
            method: "GET",
            uri: "https://api.spotify.com/v1/me/player/devices",
            json: true,
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };

        return new Promise((resolve: any, reject: any) => {
            request(options)
                .then(result => {
                    resolve(result.devices);
                });
        });
    }

    private getTrack(query: string) {
        query = query.replace("play", "").replace("start", "").replace(" ", "%20");
        let options: {} = {
            method: "GET",
            uri: `https://api.spotify.com/v1/search?query=${query}&type=track&market=DK&offset=0&limit=5`,
            json: true,
            headers: {
                Authorization: ` Bearer ${this.accessToken}`
            }
        };

        return new Promise((resolve: any, reject: any) => {
            request(options)
                .then(result => {
                    resolve(result.tracks.items);
                });
        });
    }

    static getAuthURL(stateSecret: string) {
        return "https://accounts.spotify.com/authorize?" +
            querystring.stringify({
                response_type: "code",
                client_id: process.env.spotifyClientID || config.spotifyClientID,
                scope: "user-modify-playback-state user-read-playback-state",
                redirect_uri: process.env.spotifyCallbackURL || config.spotifyCallbackURL,
                state: stateSecret
            });
    }

    static getToken(code: string) {
        let buffer: string = new Buffer(`${process.env.spotifyClientID || config.spotifyClientID}:${process.env.spotifyClientSecret || config.spotifyClientSecret}`).toString("base64");        
        let options = {
            method: "POST",
            url: "https://accounts.spotify.com/api/token",
            form: {
                code: code,
                redirect_uri: process.env.spotifyCallbackURL || config.spotifyCallbackURL,
                grant_type: "authorization_code"
            },
            headers: {
                "Authorization": `Basic ${buffer}`
            },
            json: true
        };
        return new Promise((resolve: any, reject: any) => {
            request(options)
                .then(result => {
                    resolve(result);
                });
        });
    }
}