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
                
            },      // Public:
        };
    }),
    
    
    /**
     * Everything defined in `Client` lives only in the client (browser).
     */
    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        var UserRole;

        var ThisComponent;
        return {
            __ctor: function() {
                ThisComponent = this;
            },

            // ################################################################################################
            // Setup

            initClient: function() {
                UserRole = Instance.User.UserRole;
            },

            /**
             *
             */
            setupUI: function(UIMgr, app) {
                


                // create Settings controller
                app.lazyController('homeCtrl', 
                    ['$scope', function($scope) {
                    UIMgr.registerPageScope(ThisComponent, $scope);

                    $scope.userRoleToString = function(userRole) {
                        return Instance.User.UserRole.getName(userRole);
                    };

                    console.log('123');
                    console.log('123');
                    console.log('123');
                    console.log('123');

                }]);



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