$(function () {
    if ($.cookie("spotify_accessToken") != null) {
        validateSpotifyToken();
    };

    if ($.cookie("plex_ip") != null && $.cookie("plex_port") != null && $.cookie("plex_accessToken") != null) {
        validatePlexToken();
    };

    if ($.cookie("pushbullet_accessToken") != null) {
        validatePushbulletToken();
    };
});

function getDay() {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let date = new Date();
    travis.say(`${days[date.getDay()]}`);
}

function getMonth() {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    travis.say(`${months[date.getMonth()]}`);
}

function getDefinition(term: string) {
    $.ajax({
        type: "PUT",
        url: "/api/urban-dictionary",
        data: {
            term
        },
        headers: {
            Accept: "application/json"
        },
        success: (result: any) => {
            travis.say(result);
        }
    });
}

function controlSpotify(action: string) {
    $.ajax({
        type: "PUT",
        url: "/api/spotify/control",
        data: {
            accessToken: $.cookie("spotify_accessToken"),
            action
        }
    });
}

function controlPushbullet(action: string) {
    $.ajax({
        type: "PUT",
        url: "/api/pushbullet/control",
        data: {
            accessToken: $.cookie("pushbullet_accessToken"),
            action
        }
    });
}

function validateSpotifyToken() {
    $.ajax({
        type: "PUT",
        url: "/api/spotify/validate",
        headers: {
            Accept: "application/json"
        },
        data: {
            accessToken: $.cookie("spotify_accessToken")
        },
        success: (result: boolean) => {
            if (result) {
                $("#spotify").removeClass("filtered");
            } else {
                $(location).attr("href", "/auth/spotify");
            };
        }
    });
}

function validatePlexToken() {
    $.ajax({
        type: "PUT",
        url: "/api/plex/validate",
        headers: {
            Accept: "application/json"
        },
        data: {
            ip: $.cookie("plex_ip"),
            port: $.cookie("plex_port"),
            accessToken: $.cookie("plex_accessToken")
        },
        success: (result: boolean) => {
            if (result) {
                $("#plex").removeClass("filtered");
            } else {
                // Let the user know the token is now invalid
            };
        }
    });
}

function validatePushbulletToken() {
    $.ajax({
        type: "PUT",
        url: "/api/pushbullet/validate",
        headers: {
            Accept: "application/json"
        },
        data: {
            accessToken: $.cookie("pushbullet_accessToken")
        },
        success: (result: boolean) => {
            if (result) {
                $("#pushbullet").removeClass("filtered");
                // } else {
                //     $(location).attr("href", "/auth/pushbullet");
            };
        }
    });
}

function getPlexPin() {
    $.ajax({
        type: "GET",
        url: "/api/plex/auth",
        headers: {
            Accept: "application/json"
        },
        success: (result: any) => {
            console.log(result);
        }
    });
}

function checkPlexPin(requestId: string) {
    $.ajax({
        type: "PUT",
        url: "/api/plex/auth",
        headers: {
            Accept: "application/json"
        },
        data: {
            requestId
        },
        success: (result: any) => {
            if (result != null) {
                $.cookie("plex_accessToken", result);
            }
        }
    });
}

function getJoke() {
    $.ajax({
        type: "GET",
        url: "https://icanhazdadjoke.com/",
        headers: {
            Accept: "application/json"
        },
        success: (result: any) => {
            travis.say(result.joke);
        }
    });
}