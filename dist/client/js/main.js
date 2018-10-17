$(function () {
    if ($.cookie("spotify_accessToken") != null) {
        validateSpotifyToken();
    }
    ;
    if ($.cookie("plex_ip") != null && $.cookie("plex_port") != null && $.cookie("plex_accessToken") != null) {
        validatePlexToken();
    }
    ;
});
function getDay() {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var date = new Date();
    artyom.say("" + days[date.getDay()]);
}
function getMonth() {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date = new Date();
    artyom.say("" + months[date.getMonth()]);
}
function getDefinition(term) {
    $.ajax({
        type: "PUT",
        url: "/api/urban-dictionary",
        data: {
            term: term
        },
        headers: {
            Accept: "application/json"
        },
        success: function (result) {
            artyom.say(result);
        }
    });
}
function controlSpotify(action) {
    $.ajax({
        type: "PUT",
        url: "/api/spotify/control",
        data: {
            accessToken: $.cookie("spotify_accessToken"),
            action: action.split(" ").join("").toLowerCase()
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
        success: function (result) {
            if (result) {
                $("#spotify").removeClass("filtered");
            }
            else {
                $(location).attr("href", "/auth/spotify");
            }
            ;
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
        success: function (result) {
            if (result) {
                $("#plex").removeClass("filtered");
            }
            else {
                // Let the user know the token is now invalid
            }
            ;
        }
    });
}
function getJoke() {
    $.ajax({
        url: "https://icanhazdadjoke.com/",
        headers: {
            Accept: "application/json"
        },
        success: function (result) {
            artyom.say(result.joke);
        }
    });
}
