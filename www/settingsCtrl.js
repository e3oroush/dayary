var settingsCtrl = function (
    $scope, $http, $state,
    errorService, settingsService, encryptionService, lockService
) {
    var devPassphrase = "Very secret phrase";

    var saveSettings = function () {
        // TODO: consider moving this to settingsService
        encryptionService.setPassphrase($scope.settings.passphrase);
        lockService.setLockTimeout($scope.settings.lockTimeoutMin);
        lockService.setLockOnBlur($scope.settings.lockOnBlur);

        lockService.unlock();

        $state.go("records");
    };

    var processServerHash = function (hash) {
        var devHash = encryptionService.computeHash(devPassphrase);
        // TODO: possibly not needed any more - settingsService.settings.hash
        encryptionService.hash = hash;

        if (hash && hash === devHash) {
            // Dev mode - development pass phrase to be used
            settingsService.settings.passphrase = devPassphrase;
            saveSettings();
        }
    };

    $scope.settings = settingsService.settings;

    if (settingsService.initialized) {
        // Do nothing
    }
    else {
        $http.get("/api/settings")
            .success(function (settings) {
                // TODO: extract a function; possibly in settingsService
                $scope.settings.hash = settings.hash;
                // TODO: save serialized values in backend, not string - then
                // no need to parse here
                $scope.settings.autosaveIntervalSec = +settings.autosaveIntervalSec;
                $scope.settings.lockTimeoutMin = +settings.lockTimeoutMin;
                $scope.settings.lockOnBlur = !!(+settings.lockOnBlur);

                settingsService.initialized = true;
                processServerHash(settings.hash);
            })
            .error(function () {
                errorService.reportError("failure requesting settings");
            });
    }

    $scope.invalidPassphrase = function () {
        var computed = encryptionService.computeHash(
            $scope.settings.passphrase
        );

        if ($scope.settings.passphrase) {
            if (encryptionService.hash) {
                return encryptionService.hash !== computed;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    };

    $scope.done = function () {
        // TODO: return immediately if nothing has changed

        var hash = encryptionService.computeHash(
            $scope.settings.passphrase
        );

        var settings = _.omit($scope.settings, 'hash', 'passphrase');

        // TODO: consider running simply $q.all() instead
        $http.put("/api/settings/hash", hash)
            .success(function () {

                $http.put("/api/settings", settings)
                    .success(function () {
                        saveSettings();
                    })
                    .error(function () {
                        var msg = "failure saving settings";
                        errorService.reportError(msg);
                    });
            })
            .error(function () {
                var msg = "failure setting hash for the pass phrase";
                errorService.reportError(msg);
            })
    };
};
