var getAuthTokenFromHash = function () {
    var hash = window.location.hash;
    hash = hash.substr(1);

    var hashMap = {};

    hash.split('&')
        .map(function (element) { return element.split('='); })
        .forEach(function (pair) { hashMap[pair[0]] = pair[1]; });

    return hashMap.access_token;
};

var authTokenFromHash = getAuthTokenFromHash();

if (authTokenFromHash) {
    localStorage.dropboxAuthToken = authTokenFromHash;
}

if (localStorage.dropboxAuthToken) {
    window.location.href = "/dayary";
}
else {
    var dropbox = new Dropbox({ clientId: "lxytl4933iajbwu" });
    var authUrl = dropbox.getAuthenticationUrl(
        'https://e3oroush.github.io/dayary/www/login/dropbox.html'


    );
    window.location.href = authUrl;
}
