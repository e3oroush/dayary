var settingsCtrl = function (
    $scope, $http, $timeout, $window,
    $state,
    encryptionService, recordService
) {
    var devPassphrase = "Very secret phrase";

    $scope.passphrase = encryptionService.getPassphrase();
    $scope.autosaveInterval = recordService.autosaveInterval;
    $scope.lockTimeout = { minutes: 5 };

    $scope.invalidPassphrase = function () {
        var computed = encryptionService.computeHash($scope.passphrase);

        if ($scope.passphrase) {
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

    var saveSettings = function () {
        encryptionService.setPassphrase($scope.passphrase);
        $state.go("records");
    };

    $scope.done = function () {
        computed = encryptionService.computeHash($scope.passphrase);

        if (computed === encryptionService.hash) {
            saveSettings();
            return;
        }

        $http.put("/api/hash", computed)
            .success(saveSettings)
            .error(function () {
                var msg = "failure setting hash for the pass phrase";
                errorService.reportError(msg);
            });
    };

    // TODO: consider moving this to recordsCtrl
    var lock = function () {
        $scope.settingsEdit.show = true;
        encryptionService.lock();
    };

    $timeout(
        lock,
        $scope.lockTimeout.minutes * 60 * 1000
    );

    $window.onblur = lock;

    var processServerHash = function (hash) {
        var devHash = encryptionService.computeHash(devPassphrase);
        encryptionService.hash = hash;

        if (hash && hash === devHash) {
            // Dev mode - development pass phrase to be used
            $scope.passphrase = devPassphrase;
            $scope.done();
        }
        else {
            $scope.settingsEdit.show = true;
        }
    };

    if (encryptionService.hash === null) {
        $http.get("/api/hash")
            .success(processServerHash)
            .error(function () {
                errorService.reportError("failure getting pass phrase hash");
            });
    }
};

