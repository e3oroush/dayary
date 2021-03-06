var dropboxCtrl = function (
    $scope, errorService, settingsService, syncService, dropboxService
) {
    $scope.isAuthenticated = dropboxService.isAuthenticated();
    $scope.dropboxUser = "N/A";

    $scope.getData = function () {
        dropboxService.accountInfo()
            .then(function (accountInfo) {
                $scope.dropboxUser = accountInfo.name.display_name;
            })
            .catch(function (message) {
                errorService.reportError(
                    "failure accessing Dropbox account info: " + message
                );
            });
    };

    $scope.listFiles = function () {
        $scope.listing = true;

        dropboxService.listFiles(settingsService.settings.dropboxFolder)
            .then(function (entries) {
                $scope.listing = false;
                $scope.files = entries;
            })
            .catch(function (message) {
                $scope.listing = false;
                errorService.reportError(
                    "failure accessing Dropbox account info: " + message
                );
            });
    };

    $scope.autoSync = function () {
        syncService.sync()
            .then(function () {
                console.log("Auto sync finished successfully");
            })
            .catch(function (message) {
                errorService.reportError("auto sync fail: " + message);
            });
    };
};
