var settingsService = function () {

    // TODO: consider removing this service; leave a constant only
    var service = {};

    service.settings = {
        autosaveIntervalSec: 30,
        lockTimeoutMin: 5,
        lockOnBlur: false,
        dropboxFolder: "/home/Apps/my_dayary"
    };

    service.init = function (settings) {
        service.settings = settings;
    };

    return service;
};

