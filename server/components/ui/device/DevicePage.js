/**
 * 
 */
"use strict";

var NoGapDef = require('nogap').Def;

module.exports = NoGapDef.component({
    /**
     * Everything defined in `Host` lives only on the host side (Node).
     */
    Host: NoGapDef.defHost(function(SharedTools, Shared, SharedContext) { 
        var componentsRoot = '../../';
        var libRoot = componentsRoot + '../lib/';
        var SequelizeUtil;

        return {
            Assets: {
                Files: {
                    string: {
                        template: 'DevicePage.html'
                    }
                },
                AutoIncludes: {
                }
            },

            __ctor: function () {
                SequelizeUtil = require(libRoot + 'SequelizeUtil');
            },
                    
            /**
             * 
             */
            initHost: function() {
                
            },
            
            /**
             * Host commands can be directly called by the client
             */
            Public: {
                rebootDevice: function(deviceId) {
                    if (!this.Instance.User.isStaff()) 
                        return Promise.reject(makeError('error.invalid.permissions'));

                    // TODO: Get device clients independent of session, then reboot
                    //console.error('NYI: rebootDevice');
                    return Shared.DeviceStatus.runForDevice(deviceId, function(Instance) {
                        return Instance.DeviceMain.client.reboot();
                    });
                },

                restartDevice: function(deviceId) {
                    if (!this.Instance.User.isStaff()) 
                        return Promise.reject(makeError('error.invalid.permissions'));

                    // TODO: Get device clients independent of session, then restart
                    //console.error('NYI: restartDevice');
                    return Shared.DeviceStatus.runForDevice(deviceId, function(Instance) {
                        return Instance.DeviceMain.client.restart();
                    });
                }
            },
        };
    }),
    
    
    /**
     * Everything defined in `Client` lives only in the client (browser).
     */
    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        var ThisComponent;

        return {
            __ctor: function() {
                ThisComponent = this;
            },

            /**
             * Prepares the home page controller.
             */
            setupUI: function(UIMgr, app) {
                ThisComponent.deviceSelection = new Instance.UIMain.SelectionState('deviceId');

                // create DevicePage controller
                app.lazyController('deviceCtrl', function($scope) {
                    UIMgr.registerPageScope(ThisComponent, $scope);
                    
                    // customize your $scope here:
                    $scope.DeviceJobType = Instance.Device.DeviceJobType;
                    $scope.deviceCache = Instance.Device.devices;

                    $scope.onChange = function() {
                        $scope.errorMessage = null;
                        //ThisComponent.deviceSaved = false;
                    };


                    // #########################################################################################################
                    // Devices - general

                    $scope.registerNewDevice = function(name) {
                        $scope.onChange();

                        ThisComponent.deviceSaving = true;
                        ThisComponent.deviceSaved = true;

                        Instance.Device.host.registerDevice(name)
                        .finally(function() {
                            ThisComponent.deviceSaving = false;
                        })
                        .then(function(newDevice) {
                            // select new device!
                            ThisComponent.deviceSelection.toggleSelection(newDevice);
                            ThisComponent.page.invalidateView();
                        })
                        .catch(function(err) {
                            ThisComponent.deviceSaved = false;
                            $scope.handleError(err);
                        });
                    };

                    $scope.downloadImage = function(device) {
                        // start downloading image
                        Instance.DeviceImage.downloadDeviceImage();
                    };

                    $scope.startWritingDeviceWifiConfigFile = function() {
                        ThisComponent.writingDeviceWifiConfigFile = !ThisComponent.writingDeviceWifiConfigFile;
                        if (ThisComponent.writingDeviceWifiConfigFile) {
                            ThisComponent.busy = true;
                            
                            return Instance.AppConfig.requestConfigValue('deviceWifiConnectionFile')
                            .finally(function() {
                                ThisComponent.busy = false;
                            })
                            .then(function(val) {
                                ThisComponent.page.invalidateView();
                            })
                            .catch($scope.handleError.bind($scope));
                        }
                    };

                    $scope.updateDeviceWifiConfigFile = function() {
                        Instance.AppConfig.updateConfigValue('deviceWifiConnectionFile', Instance.AppConfig.getValue('deviceWifiConnectionFile'));
                    };


                    // #########################################################################################################
                    // Devices - individual

                    $scope.isDeviceActive = function(device) {
                        var lastActiveTime = ThisComponent.deviceLastActiveTimes[device.deviceId];

                        // must have checked in within the last minute
                        return lastActiveTime && 
                            new Date(lastActiveTime).getTime() >= (Date.now() - 60 * 1000);
                    };
                    

                    $scope.saveDeviceName = function(device, done) {
                        $scope.onChange();

                        ThisComponent.deviceSaving = true;
                        ThisComponent.deviceSaved = true;

                        Promise.join(
                            //Instance.Device.devices.updateObject(device)
                            Instance.User.users.updateObject(device.getUserNow())
                        )
                        .finally(function() {
                            ThisComponent.deviceSaving = false;
                        })
                        .then(function(newDevice) {
                            ThisComponent.page.invalidateView();
                        })
                        .catch(function(err) {
                            ThisComponent.deviceSaved = false;
                            $scope.handleError(err);
                        });
                    };

                    $scope.showDeviceConfig = function(device) {
                        if (ThisComponent.showDeviceConfig) {
                            // toggle it off
                            ThisComponent.showDeviceConfig = false;
                            return;
                        }

                        ThisComponent.busy = true;

                        Instance.DeviceConfiguration.host.getDeviceConfigPublic(device.deviceId)
                        .finally(function() {
                            ThisComponent.busy = false;
                        })
                        .then(function(deviceSettings) {
                            ThisComponent.currentDeviceSettings = deviceSettings;
                            ThisComponent.showDeviceConfig = true;
                            ThisComponent.page.invalidateView();
                        })
                        .catch($scope.handleError.bind($scope));
                    };

                    $scope.setDeviceJobType = function(device, jobType) {
                        $scope.updateDevice({
                            deviceId: device.deviceId,
                            currentJobType: jobType
                        });
                    };

                    $scope.updateDevice = function(deviceUpdate) {
                        ThisComponent.busy = true;

                        var devices = Instance.Device.devices;

                        return devices.updateObject(deviceUpdate)
                        .finally(function() {
                            ThisComponent.busy = false;
                        })
                        .then(function(deviceSettings) {
                            // success!
                            ThisComponent.page.invalidateView();
                        })
                        .catch($scope.handleError.bind($scope));

                    };


                    // #######################################################################################
                    // Restart, Reboot, Reset + Delete

                    $scope.tryRestartDevice = function(device) {
                        $scope.onChange();

                        // var nProblems = 0;
                        // if (nProblems > 0) {
                        // see: http://angular-ui.github.io/bootstrap/#modal
                        var title = 'WARNING - You are restarting `' + device.getUserNow().userName + '`';
                        var body = 'This will stop and restart the currently running device client process.' +
                            'Do you really want to RESTART device `' + device.getUserNow().userName + '`?';
                        var onOk = function() {
                            // user pressed Ok -> Tell host to reset it.
                            doRestartDevice(device);
                        };
                        var onDismiss;      // don't do anything on dismiss
                        $scope.okCancelModal('', title, body, onOk, onDismiss);
                    };

                    var doRestartDevice = function(device) {
                        ThisComponent.busy = true;
                        ThisComponent.host.restartDevice(device.deviceId)
                        .finally(function() {
                            ThisComponent.busy = false;
                        })
                        .then(function() {
                            // invalidate view
                            ThisComponent.page.invalidateView();
                        })
                        .catch($scope.handleError.bind($scope));
                    };

                    $scope.tryRebootDevice = function(device) {
                        $scope.onChange();

                        // var nProblems = 0;
                        // if (nProblems > 0) {
                        // see: http://angular-ui.github.io/bootstrap/#modal
                        var title = 'WARNING - You are rebooting `' + device.getUserNow().userName + '`';
                        var body = 'This will shutdown the entire device. ' +
                            'It might take several minutes for the device to come back online. ' +
                            'Do you really want to REBOOT device `' + device.getUserNow().userName + '`?';
                        var onOk = function() {
                            // user pressed Ok -> Tell host to reset it.
                            doRebootDevice(device);
                        };
                        var onDismiss;      // don't do anything on dismiss
                        $scope.okCancelModal('', title, body, onOk, onDismiss);
                    };

                    var doRebootDevice = function(device) {
                        ThisComponent.busy = true;
                        ThisComponent.host.rebootDevice(device.deviceId)
                        .finally(function() {
                            ThisComponent.busy = false;
                        })
                        .then(function() {
                            // invalidate view
                            ThisComponent.page.invalidateView();
                        })
                        .catch($scope.handleError.bind($scope));
                    };

                    $scope.tryResetDevice = function(device) {
                        $scope.onChange();

                        // var nProblems = 0;
                        // if (nProblems > 0) {
                        // see: http://angular-ui.github.io/bootstrap/#modal
                        var title = 'DANGER - You are resetting `' + device.getUserNow().userName + '`';
                        var body = 'Upon next connection attempt, the device will get a new ' +
                            'configuration and new credentials without having to login first. ' +
                            'That is why the device has to reset soon, or attackers can use this vulnerability to hi-jack ' +
                            'device privlege levels. ' +
                            'Do you really want to RESET device `' + device.getUserNow().userName + '`?';
                        var onOk = function() {
                            // user pressed Ok -> Tell host to reset it.
                            doResetDevice(device);
                        };
                        var onDismiss;      // don't do anything on dismiss
                        $scope.okCancelModal('', title, body, onOk, onDismiss);
                    };


                    var doResetDevice = function(device) {
                        ThisComponent.busy = true;
                        Instance.Device.host.resetDevice(device.deviceId)
                        .finally(function() {
                            ThisComponent.busy = false;
                        })
                        .then(function() {
                            // invalidate view
                            ThisComponent.page.invalidateView();
                        })
                        .catch($scope.handleError.bind($scope));
                    };


                    $scope.tryDeleteDevice = function(device) {
                        $scope.errorMessage = null;

                        // var nProblems = 0;
                        // if (nProblems > 0) {
                        // see: http://angular-ui.github.io/bootstrap/#modal
                        var title = 'WARNING - You are deleting `' + device.getUserNow().userName + '`';
                        var body = 'This way, the device will not be able to log into the server anymore, ' +
                            ' and you will need to re-configure it manually for future operation! ' +
                            'Do you really want to delete device `' + device.getUserNow().userName + '`?';
                        var onOk = function() {
                            // user pressed Ok -> Tell host to delete it.
                            doDeleteDevice(device);
                        };
                        var onDismiss;      // don't do anything on dismiss
                        $scope.okCancelModal('', title, body, onOk, onDismiss);
                    };

                    var doDeleteDevice = function(device) {
                        // delete user object (device will be deleted with it)
                        Promise.join(
                            Instance.User.users.deleteObject(device.getUserNow().uid),
                            Instance.Device.devices.deleteObject(device.deviceId)
                        )
                        .then(function() {
                            // stop editing
                            ThisComponent.deviceSelection.unsetSelection();

                            // invalidate view
                            ThisComponent.page.invalidateView();
                        })
                        .catch($scope.handleError.bind($scope));
                    };
                });

                // register page
                Instance.UIMgr.registerPage(this, 'Device', this.assets.template, {
                    iconClasses: 'fa fa-cogs'
                });
            },

            onPageActivate: function() {
                return Promise.join(
                    // load all users into cache
                    Instance.User.users.readObjects(),

                    // load all devices into cache
                    Instance.Device.devices.readObjects(),

                    this.refreshData()
                )
                .spread(function(users, devices) {
                    ThisComponent.page.invalidateView();
                })
                .catch(function(err) {
                    ThisComponent.page.handleError(err);
                });
            },

            refreshDelay: 5000, // refresh every 5 seconds

            refreshData: function() {
                return Promise.join(
                    Instance.DeviceStatus.host.getDeviceLastActiveTimes(),

                    // re-load devices
                    Instance.Device.devices.readObjects()
                )
                .spread(function(deviceLastActiveTimes, devices) {
                    ThisComponent.deviceLastActiveTimes = deviceLastActiveTimes;
                    ThisComponent.page.invalidateView();
                })
                .catch(function(err) {
                    ThisComponent.page.handleError(err);
                });
            },

            cacheEventHandlers: {
                devices: {
                    sendingReadQueryToHost: function(queryInput) {
                        ThisComponent.busy = true;
                        ThisComponent.page.invalidateView();
                    },
                    updated: function(newValues) {
                        ThisComponent.busy = false;
                        ThisComponent.page.invalidateView();
                    }
                },
            }
        };
    })
});
