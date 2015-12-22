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
                        template: 'ShowQuestionPage.html'
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

                    return Shared.DeviceStatus.runForDevice(deviceId, function(Instance) {
                        console.log("test");
                        return Instance.DeviceSeek.client.initQuestionNumbers(questionNumbers);
                        // return Instance.DeviceSeek.client.printffclient();
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
                // create Home controller
                app.lazyController('showQuestionCtrl', function($scope) {
                    UIMgr.registerPageScope(ThisComponent, $scope);
                    
                    // customize your HomePage's $scope here:
                    // for test function

                    $scope.activitySelect; // choose by dropdown  
                    $scope.questionNumber = 0;

                    $scope.questionAmount;
                    // $scope.showQuestion; // show question to user

                    $scope.changeActivity = function(){
                        // choose activity
                        console.log($scope.activitySelect);
                        $scope.showQuestion = Instance.ActivityQuestion.activityQuestions.indices.byActivityId.get($scope.activitySelect);
                        
                        console.log($scope.showQuestion.length);
                        $scope.questionNumber = 0;
                    };

                    $scope.nextQuestion = function(){
                        if( $scope.questionNumber < ( $scope.showQuestion.length - 1) ) {
                            $scope.questionNumber = $scope.questionNumber + 1;
                        }


                    };

                    $scope.preQuestion = function(){
                        
                        if($scope.questionNumber != 0){
                            $scope.questionNumber = $scope.questionNumber - 1;
                        }
                    }




                    $scope.range = function(max){
                        var input = []; 
                        for(var i = 1; i <= max ; i++){
                             input.push(i);
                        }
                        return input;
                    };

                    // $scope.goAction = function(activityId) {
                        // ThisComponent.host.printff("3","3");
                        // console.log(Instance.Activity.activities.list.length);
                    // };



                });

                // register page
                Instance.UIMgr.registerPage(this, 'ShowQuestion', this.assets.template, {
                    iconClasses: 'fa fa-calendar-o'
                });
            },

            getVideoNumber: function() {
                return Instance.Activity.activities.list.length;
            },

            onPageActivate: function() {//TODO Debug
                Instance.User.users.readObjects();
                Instance.Activity.activities.readObjects();
                Instance.ActivityQuestion.activityQuestions.readObjects();
                ThisComponent.page.invalidateView();
            },

            cacheEventHandlers: {
                users: {
                    updated: function(newValues, queryData, users) {
                        ThisComponent.page.invalidateView();
                    }
                },
                activities: {
                    updated: function(newValues, queryData, users) {
                        ThisComponent.page.invalidateView();
                    }
                },
                activityQuestions: {
                    updated: function(newValues, queryData, users) {
                        ThisComponent.page.invalidateView();
                    }
                }
            },
            
            /**
             * Client commands can be directly called by the host
             */
            Public: {
                
            }
        };
    })
});