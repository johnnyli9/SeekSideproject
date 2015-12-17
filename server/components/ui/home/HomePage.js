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
        return {
            Assets: {
                Files: {
                    string: {
                        template: 'HomePage.html'
                    }
                },
                AutoIncludes: {
                }
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
                // for test function
                printff: function(deviceId, questionNumbers) {
                    console.log("test is work!!!!!!!!");
                    // if (!this.Instance.User.isStaff()) 
                    //     return Promise.reject(makeError('error.invalid.permissions'));

                    // runForeachDevice ..... TODO
                    // return Shared.DeviceStatus.runForeachDevice(function(Instance) {
                    //     console.log(Instance);                        
                    // }
                    // var test = this.Instance.DeviceResult.results.indices.deviceId.get("3");
                    // console.log(test);
                    

                    // return Shared.DeviceStatus.runForDevice(deviceId, function(Instance) {
                    //     console.log("test");
                    //     return Instance.DeviceSeek.client.initQuestionNumbers(questionNumbers);
                        // return Instance.DeviceSeek.client.printffclient();
                    // });
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
                // create Home controller
                app.lazyController('homeCtrl', function($scope) {
                    UIMgr.registerPageScope(ThisComponent, $scope);
                    
                    // customize your HomePage's $scope here:
                    // for test function
                    $scope.test = function() {
                        console.log("????");
                        // ThisComponent.host.printff("3","3");
                    };

                });

                // register page
                Instance.UIMgr.registerPage(this, 'Home', this.assets.template, {
                    iconClasses: 'fa fa-home'
                });
            },
            
            /**
             * Client commands can be directly called by the host
             */
            Public: {
                
            }
        };
    })
});